package onboarding

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) RegisterRoutes(e *echo.Group) {
	// Onboarding
	e.POST("/onboarding/onboard", h.handleOnboard)

	// Tenant Management
	e.GET("/tenants", h.handleListTenants)
	e.GET("/tenants/zitadel", h.handleListZitadelOrgs)
	e.GET("/tenants/:id", h.handleGetTenant)
	e.POST("/tenants/:id/sync", h.handleSyncToZitadel)
	e.POST("/tenants/:id/suspend", h.handleSuspendTenant)
	e.POST("/tenants/:id/activate", h.handleReactivateTenant)
	e.DELETE("/tenants/:id", h.handleDeleteTenant)

	// User Management
	e.GET("/tenants/:id/users", h.handleListUsers)
	e.POST("/tenants/:id/users", h.handleAddUser)
	e.DELETE("/tenants/:id/users/:userId", h.handleDeleteUser)
}

func (h *Handler) handleOnboard(c echo.Context) error {
	var req RegisterOrganizationRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	resp, err := h.service.Onboard(c.Request().Context(), req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusCreated, resp)
}

func (h *Handler) handleListTenants(c echo.Context) error {
	tenants, err := h.service.ListTenants(c.Request().Context())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, tenants)
}

func (h *Handler) handleListZitadelOrgs(c echo.Context) error {
	orgs, err := h.service.ListZitadelOrgs(c.Request().Context())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, orgs)
}

func (h *Handler) handleGetTenant(c echo.Context) error {
	id := c.Param("id")
	tenant, err := h.service.GetTenant(c.Request().Context(), id)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Tenant not found"})
	}

	return c.JSON(http.StatusOK, tenant)
}

func (h *Handler) handleSyncToZitadel(c echo.Context) error {
	id := c.Param("id")
	if err := h.service.SyncToZitadel(c.Request().Context(), id); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"status": "synced"})
}

func (h *Handler) handleSuspendTenant(c echo.Context) error {
	id := c.Param("id")
	if err := h.service.SuspendTenant(c.Request().Context(), id); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"status": "suspended"})
}

func (h *Handler) handleReactivateTenant(c echo.Context) error {
	id := c.Param("id")
	if err := h.service.ReactivateTenant(c.Request().Context(), id); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"status": "active"})
}

func (h *Handler) handleDeleteTenant(c echo.Context) error {
	id := c.Param("id")
	if err := h.service.DeleteTenant(c.Request().Context(), id); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"status": "deleted"})
}

func (h *Handler) handleListUsers(c echo.Context) error {
	id := c.Param("id")
	users, err := h.service.ListUsers(c.Request().Context(), id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, users)
}

func (h *Handler) handleAddUser(c echo.Context) error {
	id := c.Param("id")
	var req struct {
		Username  string `json:"username"`
		Email     string `json:"email"`
		FirstName string `json:"firstName"`
		LastName  string `json:"lastName"`
		Password  string `json:"password"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request"})
	}

	userID, err := h.service.AddUser(c.Request().Context(), id, req.Username, req.Email, req.FirstName, req.LastName, req.Password)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusCreated, map[string]string{"userId": userID})
}

func (h *Handler) handleDeleteUser(c echo.Context) error {
	id := c.Param("id")
	userId := c.Param("userId")
	if err := h.service.DeleteUser(c.Request().Context(), id, userId); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "deleted"})
}
