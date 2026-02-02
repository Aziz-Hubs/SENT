package rpc

import (
	"encoding/json"
	"fmt"
	"net/http"
	"reflect"
)

// RpcRequest matches the frontend proxy payload
type RpcRequest struct {
	Module string        `json:"module"`
	Bridge string        `json:"bridge"`
	Method string        `json:"method"`
	Args   []interface{} `json:"args"`
}

// RpcHandler manages the dispatching of web requests to Wails bridges
type RpcHandler struct {
	// Registry: map[package_name]map[bridge_name]interface{}
	services map[string]map[string]interface{}
}

// NewRpcHandler initializes a new dispatcher
func NewRpcHandler() *RpcHandler {
	return &RpcHandler{
		services: make(map[string]map[string]interface{}),
	}
}

// Register adds a bridge instance to the RPC registry
func (h *RpcHandler) Register(pkgName string, bridgeName string, service interface{}) {
	if h.services[pkgName] == nil {
		h.services[pkgName] = make(map[string]interface{})
	}
	h.services[pkgName][bridgeName] = service
}

func (h *RpcHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req RpcRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// 1. Lookup Service
	pkg, ok := h.services[req.Module]
	if !ok {
		http.Error(w, fmt.Sprintf("Module %s not found", req.Module), http.StatusNotFound)
		return
	}

	bridge, ok := pkg[req.Bridge]
	if !ok {
		http.Error(w, fmt.Sprintf("Bridge %s not found in module %s", req.Bridge, req.Module), http.StatusNotFound)
		return
	}

	// 2. Reflect on the method
	val := reflect.ValueOf(bridge)
	method := val.MethodByName(req.Method)
	if !method.IsValid() {
		http.Error(w, fmt.Sprintf("Method %s not found on bridge %s", req.Method, req.Bridge), http.StatusNotFound)
		return
	}

	// 3. Prepare Arguments
	methodType := method.Type()
	if methodType.NumIn() != len(req.Args) {
		http.Error(w, fmt.Sprintf("Argument mismatch: expected %d, got %d", methodType.NumIn(), len(req.Args)), http.StatusBadRequest)
		return
	}

	inArgs := make([]reflect.Value, len(req.Args))
	for i := 0; i < len(req.Args); i++ {
		// Convert input args to correct Go types (basic JSON decoding needs help with ints/floats)
		argVal := reflect.ValueOf(req.Args[i])
		expectedType := methodType.In(i)

		if argVal.Type().ConvertibleTo(expectedType) {
			inArgs[i] = argVal.Convert(expectedType)
		} else {
			// Try unmarshaling specifically for structs/slices
			jsonBytes, _ := json.Marshal(req.Args[i])
			newArg := reflect.New(expectedType).Interface()
			if err := json.Unmarshal(jsonBytes, &newArg); err != nil {
				http.Error(w, fmt.Sprintf("Failed to convert argument %d: %v", i, err), http.StatusBadRequest)
				return
			}
			inArgs[i] = reflect.ValueOf(newArg).Elem()
		}
	}

	// 4. Call Method
	results := method.Call(inArgs)

	// 5. Handle Results
	// Assume Wails methods return (Value, error) or just (Value)
	if len(results) == 0 {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	// If last result is an error, check if it's nil
	lastResult := results[len(results)-1]
	if lastResult.Type().Implements(reflect.TypeOf((*error)(nil)).Elem()) {
		if !lastResult.IsNil() {
			err := lastResult.Interface().(error)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		// If it's a (Value, error) signature and error is nil, return the value
		if len(results) > 1 {
			json.NewEncoder(w).Encode(results[0].Interface())
			return
		}
		w.WriteHeader(http.StatusNoContent)
		return
	}

	// Default: return first result
	json.NewEncoder(w).Encode(results[0].Interface())
}
