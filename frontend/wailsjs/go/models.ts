export namespace auth {
	
	export class UserProfile {
	    sub: string;
	    name: string;
	    email: string;
	    picture: string;
	    given_name: string;
	    family_name: string;
	    tenantId: number;
	    role: string;
	    seniority: string;
	
	    static createFrom(source: any = {}) {
	        return new UserProfile(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.sub = source["sub"];
	        this.name = source["name"];
	        this.email = source["email"];
	        this.picture = source["picture"];
	        this.given_name = source["given_name"];
	        this.family_name = source["family_name"];
	        this.tenantId = source["tenantId"];
	        this.role = source["role"];
	        this.seniority = source["seniority"];
	    }
	}

}

export namespace capital {
	
	export class AccountDTO {
	    id: number;
	    name: string;
	    number: string;
	    type: string;
	    balance: number;
	
	    static createFrom(source: any = {}) {
	        return new AccountDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.number = source["number"];
	        this.type = source["type"];
	        this.balance = source["balance"];
	    }
	}
	export class EntryRequest {
	    account_id: number;
	    amount: number;
	    direction: string;
	
	    static createFrom(source: any = {}) {
	        return new EntryRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.account_id = source["account_id"];
	        this.amount = source["amount"];
	        this.direction = source["direction"];
	    }
	}
	export class TransactionDTO {
	    id: number;
	    description: string;
	    date: time.Time;
	    total_amount: number;
	    approval_status: string;
	    reference: string;
	
	    static createFrom(source: any = {}) {
	        return new TransactionDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.description = source["description"];
	        this.date = this.convertValues(source["date"], time.Time);
	        this.total_amount = source["total_amount"];
	        this.approval_status = source["approval_status"];
	        this.reference = source["reference"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class TransactionRequest {
	    description: string;
	    date: time.Time;
	    entries: EntryRequest[];
	    user_id: number;
	
	    static createFrom(source: any = {}) {
	        return new TransactionRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.description = source["description"];
	        this.date = this.convertValues(source["date"], time.Time);
	        this.entries = this.convertValues(source["entries"], EntryRequest);
	        this.user_id = source["user_id"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace pilot {
	
	export class TicketDTO {
	    id: number;
	    subject: string;
	    description: string;
	    status: string;
	    priority: string;
	    requester: string;
	    assignee: string;
	    asset: string;
	    createdAt: time.Time;
	    deepLink: string;
	    executionPlan: Record<string, any>;
	
	    static createFrom(source: any = {}) {
	        return new TicketDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.subject = source["subject"];
	        this.description = source["description"];
	        this.status = source["status"];
	        this.priority = source["priority"];
	        this.requester = source["requester"];
	        this.assignee = source["assignee"];
	        this.asset = source["asset"];
	        this.createdAt = this.convertValues(source["createdAt"], time.Time);
	        this.deepLink = source["deepLink"];
	        this.executionPlan = source["executionPlan"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace river {
	
	export class Client_github_com_jackc_pgx_v5_Tx_ {
	
	
	    static createFrom(source: any = {}) {
	        return new Client_github_com_jackc_pgx_v5_Tx_(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	
	    }
	}

}

export namespace stock {
	
	export class AssignmentDTO {
	    id: number;
	    employeeName: string;
	    assignedAt: time.Time;
	    status: string;
	
	    static createFrom(source: any = {}) {
	        return new AssignmentDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.employeeName = source["employeeName"];
	        this.assignedAt = this.convertValues(source["assignedAt"], time.Time);
	        this.status = source["status"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class AuditLogDTO {
	    id: number;
	    action: string;
	    entityType: string;
	    entityID: number;
	    userName: string;
	    details: string;
	    createdAt: time.Time;
	
	    static createFrom(source: any = {}) {
	        return new AuditLogDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.action = source["action"];
	        this.entityType = source["entityType"];
	        this.entityID = source["entityID"];
	        this.userName = source["userName"];
	        this.details = source["details"];
	        this.createdAt = this.convertValues(source["createdAt"], time.Time);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class CategoryDTO {
	    id: number;
	    name: string;
	    type: string;
	
	    static createFrom(source: any = {}) {
	        return new CategoryDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.type = source["type"];
	    }
	}
	export class EmployeeDTO {
	    id: number;
	    name: string;
	
	    static createFrom(source: any = {}) {
	        return new EmployeeDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	    }
	}
	export class MaintenanceScheduleDTO {
	    id: number;
	    productID: number;
	    productName: string;
	    scheduledAt: time.Time;
	    completedAt: time.Time;
	    status: string;
	    notes: string;
	
	    static createFrom(source: any = {}) {
	        return new MaintenanceScheduleDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.productID = source["productID"];
	        this.productName = source["productName"];
	        this.scheduledAt = this.convertValues(source["scheduledAt"], time.Time);
	        this.completedAt = this.convertValues(source["completedAt"], time.Time);
	        this.status = source["status"];
	        this.notes = source["notes"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ProductDTO {
	    id: number;
	    sku: string;
	    name: string;
	    description: string;
	    unitCost: number;
	    quantity: number;
	    reserved: number;
	    incoming: number;
	    supplierName: string;
	    categoryName: string;
	    barcode: string;
	    minStock: number;
	    serialNumber: string;
	    purchaseDate: time.Time;
	    purchasePrice: number;
	    usefulLifeMonths: number;
	    warrantyExpiresAt: time.Time;
	    isDisposed: boolean;
	    currentValue: number;
	    location: string;
	
	    static createFrom(source: any = {}) {
	        return new ProductDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.sku = source["sku"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.unitCost = source["unitCost"];
	        this.quantity = source["quantity"];
	        this.reserved = source["reserved"];
	        this.incoming = source["incoming"];
	        this.supplierName = source["supplierName"];
	        this.categoryName = source["categoryName"];
	        this.barcode = source["barcode"];
	        this.minStock = source["minStock"];
	        this.serialNumber = source["serialNumber"];
	        this.purchaseDate = this.convertValues(source["purchaseDate"], time.Time);
	        this.purchasePrice = source["purchasePrice"];
	        this.usefulLifeMonths = source["usefulLifeMonths"];
	        this.warrantyExpiresAt = this.convertValues(source["warrantyExpiresAt"], time.Time);
	        this.isDisposed = source["isDisposed"];
	        this.currentValue = source["currentValue"];
	        this.location = source["location"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class PurchaseOrderLineDTO {
	    id: number;
	    productID: number;
	    productName: string;
	    quantity: number;
	    unitCost: number;
	    receivedQty: number;
	
	    static createFrom(source: any = {}) {
	        return new PurchaseOrderLineDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.productID = source["productID"];
	        this.productName = source["productName"];
	        this.quantity = source["quantity"];
	        this.unitCost = source["unitCost"];
	        this.receivedQty = source["receivedQty"];
	    }
	}
	export class PurchaseOrderDTO {
	    id: number;
	    poNumber: string;
	    supplierID: number;
	    supplierName: string;
	    status: string;
	    orderDate: time.Time;
	    expectedDate: time.Time;
	    totalAmount: number;
	    lines: PurchaseOrderLineDTO[];
	
	    static createFrom(source: any = {}) {
	        return new PurchaseOrderDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.poNumber = source["poNumber"];
	        this.supplierID = source["supplierID"];
	        this.supplierName = source["supplierName"];
	        this.status = source["status"];
	        this.orderDate = this.convertValues(source["orderDate"], time.Time);
	        this.expectedDate = this.convertValues(source["expectedDate"], time.Time);
	        this.totalAmount = source["totalAmount"];
	        this.lines = this.convertValues(source["lines"], PurchaseOrderLineDTO);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class SaleItem {
	    productId: number;
	    quantity: number;
	    price: number;
	    reservationId?: number;
	
	    static createFrom(source: any = {}) {
	        return new SaleItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.productId = source["productId"];
	        this.quantity = source["quantity"];
	        this.price = source["price"];
	        this.reservationId = source["reservationId"];
	    }
	}
	export class SaleRequest {
	    items: SaleItem[];
	    total: number;
	    paymentMethod: string;
	
	    static createFrom(source: any = {}) {
	        return new SaleRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.items = this.convertValues(source["items"], SaleItem);
	        this.total = source["total"];
	        this.paymentMethod = source["paymentMethod"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class StockAdjustment {
	    productId: number;
	    quantity: number;
	    type: string;
	    reason: string;
	    metadata: Record<string, any>;
	
	    static createFrom(source: any = {}) {
	        return new StockAdjustment(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.productId = source["productId"];
	        this.quantity = source["quantity"];
	        this.type = source["type"];
	        this.reason = source["reason"];
	        this.metadata = source["metadata"];
	    }
	}
	export class StockAlertDTO {
	    id: number;
	    type: string;
	    message: string;
	    isRead: boolean;
	    createdAt: time.Time;
	    productID: number;
	
	    static createFrom(source: any = {}) {
	        return new StockAlertDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.type = source["type"];
	        this.message = source["message"];
	        this.isRead = source["isRead"];
	        this.createdAt = this.convertValues(source["createdAt"], time.Time);
	        this.productID = source["productID"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class StockMovementDTO {
	    id: number;
	    type: string;
	    quantity: number;
	    reason: string;
	    date: time.Time;
	    productName: string;
	
	    static createFrom(source: any = {}) {
	        return new StockMovementDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.type = source["type"];
	        this.quantity = source["quantity"];
	        this.reason = source["reason"];
	        this.date = this.convertValues(source["date"], time.Time);
	        this.productName = source["productName"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class SupplierDTO {
	    id: number;
	    name: string;
	
	    static createFrom(source: any = {}) {
	        return new SupplierDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	    }
	}

}

export namespace time {
	
	export class Time {
	
	
	    static createFrom(source: any = {}) {
	        return new Time(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	
	    }
	}

}

