export namespace admin {
	
	export class OrgDTO {
	    id: number;
	    name: string;
	    domain: string;
	    active: boolean;
	
	    static createFrom(source: any = {}) {
	        return new OrgDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.domain = source["domain"];
	        this.active = source["active"];
	    }
	}
	export class UserDTO {
	    id: number;
	    email: string;
	    firstName: string;
	    lastName: string;
	    role: string;
	    orgName: string;
	
	    static createFrom(source: any = {}) {
	        return new UserDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.email = source["email"];
	        this.firstName = source["firstName"];
	        this.lastName = source["lastName"];
	        this.role = source["role"];
	        this.orgName = source["orgName"];
	    }
	}

}

export namespace auth {
	
	export class UserProfile {
	    sub: string;
	    name: string;
	    email: string;
	    picture: string;
	    given_name: string;
	    family_name: string;
	    tenantId: number;
	
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
	    }
	}

}

export namespace bridge {
	
	export class SystemStatus {
	    hostname: string;
	    uptime: string;
	    time: string;
	    startTime: number;
	    recentEvents: string[];
	
	    static createFrom(source: any = {}) {
	        return new SystemStatus(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.hostname = source["hostname"];
	        this.uptime = source["uptime"];
	        this.time = source["time"];
	        this.startTime = source["startTime"];
	        this.recentEvents = source["recentEvents"];
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
	export class TransactionRequest {
	    description: string;
	    // Go type: time
	    date: any;
	    entries: EntryRequest[];
	
	    static createFrom(source: any = {}) {
	        return new TransactionRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.description = source["description"];
	        this.date = this.convertValues(source["date"], null);
	        this.entries = this.convertValues(source["entries"], EntryRequest);
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
	export class TransactionDTO {
	    id: number;
	    description: string;
	    // Go type: time
	    date: any;
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
	        this.date = this.convertValues(source["date"], null);
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

}

export namespace control {
	
	export class DowngradeRecommendation {
	    IdentityID: number;
	    Email: string;
	    CurrentPlan: string;
	    SuggestedPlan: string;
	    Savings: number;
	    Reason: string;
	
	    static createFrom(source: any = {}) {
	        return new DowngradeRecommendation(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.IdentityID = source["IdentityID"];
	        this.Email = source["Email"];
	        this.CurrentPlan = source["CurrentPlan"];
	        this.SuggestedPlan = source["SuggestedPlan"];
	        this.Savings = source["Savings"];
	        this.Reason = source["Reason"];
	    }
	}

}

export namespace ent {
	
	export class SuccessionMapEdges {
	    employee?: Employee;
	    backup_candidate?: Employee;
	
	    static createFrom(source: any = {}) {
	        return new SuccessionMapEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.employee = this.convertValues(source["employee"], Employee);
	        this.backup_candidate = this.convertValues(source["backup_candidate"], Employee);
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
	export class SuccessionMap {
	    id?: number;
	    readiness_level?: string;
	    notes?: string;
	    // Go type: time
	    created_at?: any;
	    edges: SuccessionMapEdges;
	
	    static createFrom(source: any = {}) {
	        return new SuccessionMap(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.readiness_level = source["readiness_level"];
	        this.notes = source["notes"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.edges = this.convertValues(source["edges"], SuccessionMapEdges);
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
	export class CompensationAgreementEdges {
	    tenant?: Tenant;
	    employee?: Employee;
	
	    static createFrom(source: any = {}) {
	        return new CompensationAgreementEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.employee = this.convertValues(source["employee"], Employee);
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
	export class CompensationAgreement {
	    id?: number;
	    base_salary?: number;
	    currency?: string;
	    // Go type: time
	    effective_date?: any;
	    status?: string;
	    // Go type: time
	    created_at?: any;
	    edges: CompensationAgreementEdges;
	
	    static createFrom(source: any = {}) {
	        return new CompensationAgreement(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.base_salary = source["base_salary"];
	        this.currency = source["currency"];
	        this.effective_date = this.convertValues(source["effective_date"], null);
	        this.status = source["status"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.edges = this.convertValues(source["edges"], CompensationAgreementEdges);
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
	export class DepartmentEdges {
	    parent?: Department;
	    children?: Department[];
	    members?: Employee[];
	    head?: Employee;
	
	    static createFrom(source: any = {}) {
	        return new DepartmentEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.parent = this.convertValues(source["parent"], Department);
	        this.children = this.convertValues(source["children"], Department);
	        this.members = this.convertValues(source["members"], Employee);
	        this.head = this.convertValues(source["head"], Employee);
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
	export class Department {
	    id?: number;
	    name?: string;
	    code?: string;
	    description?: string;
	    edges: DepartmentEdges;
	
	    static createFrom(source: any = {}) {
	        return new Department(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.code = source["code"];
	        this.description = source["description"];
	        this.edges = this.convertValues(source["edges"], DepartmentEdges);
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
	export class EmployeeEdges {
	    tenant?: Tenant;
	    department?: Department;
	    manager?: Employee;
	    subordinates?: Employee[];
	    compensation_agreements?: CompensationAgreement[];
	    succession_plans?: SuccessionMap[];
	    backup_for?: SuccessionMap[];
	
	    static createFrom(source: any = {}) {
	        return new EmployeeEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.department = this.convertValues(source["department"], Department);
	        this.manager = this.convertValues(source["manager"], Employee);
	        this.subordinates = this.convertValues(source["subordinates"], Employee);
	        this.compensation_agreements = this.convertValues(source["compensation_agreements"], CompensationAgreement);
	        this.succession_plans = this.convertValues(source["succession_plans"], SuccessionMap);
	        this.backup_for = this.convertValues(source["backup_for"], SuccessionMap);
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
	export class Employee {
	    id?: number;
	    zitadel_id?: string;
	    employee_id?: string;
	    first_name?: string;
	    last_name?: string;
	    email?: string;
	    phone?: string;
	    status?: string;
	    salary_encrypted?: string;
	    bank_details_encrypted?: string;
	    signature_hash?: string;
	    // Go type: time
	    signed_at?: any;
	    hipo_status?: boolean;
	    // Go type: time
	    created_at?: any;
	    // Go type: time
	    updated_at?: any;
	    edges: EmployeeEdges;
	
	    static createFrom(source: any = {}) {
	        return new Employee(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.zitadel_id = source["zitadel_id"];
	        this.employee_id = source["employee_id"];
	        this.first_name = source["first_name"];
	        this.last_name = source["last_name"];
	        this.email = source["email"];
	        this.phone = source["phone"];
	        this.status = source["status"];
	        this.salary_encrypted = source["salary_encrypted"];
	        this.bank_details_encrypted = source["bank_details_encrypted"];
	        this.signature_hash = source["signature_hash"];
	        this.signed_at = this.convertValues(source["signed_at"], null);
	        this.hipo_status = source["hipo_status"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	        this.edges = this.convertValues(source["edges"], EmployeeEdges);
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
	export class BudgetForecastEdges {
	    tenant?: Tenant;
	
	    static createFrom(source: any = {}) {
	        return new BudgetForecastEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
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
	export class BudgetForecast {
	    id?: number;
	    year?: number;
	    month?: number;
	    projected_amount?: number;
	    actual_spent?: number;
	    forecast_data?: Record<string, any>;
	    // Go type: time
	    created_at?: any;
	    edges: BudgetForecastEdges;
	
	    static createFrom(source: any = {}) {
	        return new BudgetForecast(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.year = source["year"];
	        this.month = source["month"];
	        this.projected_amount = source["projected_amount"];
	        this.actual_spent = source["actual_spent"];
	        this.forecast_data = source["forecast_data"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.edges = this.convertValues(source["edges"], BudgetForecastEdges);
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
	export class StrategicRoadmapEdges {
	    tenant?: Tenant;
	
	    static createFrom(source: any = {}) {
	        return new StrategicRoadmapEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
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
	export class StrategicRoadmap {
	    id?: number;
	    project_name?: string;
	    description?: string;
	    priority?: string;
	    status?: string;
	    estimated_cost?: number;
	    // Go type: time
	    target_date?: any;
	    strategic_commentary?: string;
	    // Go type: time
	    created_at?: any;
	    // Go type: time
	    updated_at?: any;
	    edges: StrategicRoadmapEdges;
	
	    static createFrom(source: any = {}) {
	        return new StrategicRoadmap(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.project_name = source["project_name"];
	        this.description = source["description"];
	        this.priority = source["priority"];
	        this.status = source["status"];
	        this.estimated_cost = source["estimated_cost"];
	        this.target_date = this.convertValues(source["target_date"], null);
	        this.strategic_commentary = source["strategic_commentary"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	        this.edges = this.convertValues(source["edges"], StrategicRoadmapEdges);
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
	export class HealthScoreSnapshotEdges {
	    tenant?: Tenant;
	
	    static createFrom(source: any = {}) {
	        return new HealthScoreSnapshotEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
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
	export class HealthScoreSnapshot {
	    id?: number;
	    overall_score?: number;
	    performance_score?: number;
	    security_score?: number;
	    lifecycle_score?: number;
	    metadata?: Record<string, any>;
	    // Go type: time
	    timestamp?: any;
	    edges: HealthScoreSnapshotEdges;
	
	    static createFrom(source: any = {}) {
	        return new HealthScoreSnapshot(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.overall_score = source["overall_score"];
	        this.performance_score = source["performance_score"];
	        this.security_score = source["security_score"];
	        this.lifecycle_score = source["lifecycle_score"];
	        this.metadata = source["metadata"];
	        this.timestamp = this.convertValues(source["timestamp"], null);
	        this.edges = this.convertValues(source["edges"], HealthScoreSnapshotEdges);
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
	export class IVRFlowEdges {
	    tenant?: Tenant;
	
	    static createFrom(source: any = {}) {
	        return new IVRFlowEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
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
	export class IVRFlow {
	    id?: number;
	    name?: string;
	    nodes?: Record<string, any>;
	    flow_edges?: Record<string, any>;
	    is_active?: boolean;
	    version?: number;
	    // Go type: time
	    created_at?: any;
	    // Go type: time
	    updated_at?: any;
	    edges: IVRFlowEdges;
	
	    static createFrom(source: any = {}) {
	        return new IVRFlow(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.nodes = source["nodes"];
	        this.flow_edges = source["flow_edges"];
	        this.is_active = source["is_active"];
	        this.version = source["version"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	        this.edges = this.convertValues(source["edges"], IVRFlowEdges);
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
	export class ContractEdges {
	    tenant?: Tenant;
	
	    static createFrom(source: any = {}) {
	        return new ContractEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
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
	export class Contract {
	    id?: number;
	    name?: string;
	    type?: string;
	    total_hours?: number;
	    remaining_hours?: number;
	    grace_threshold_percent?: number;
	    // Go type: time
	    start_date?: any;
	    // Go type: time
	    end_date?: any;
	    is_active?: boolean;
	    edges: ContractEdges;
	
	    static createFrom(source: any = {}) {
	        return new Contract(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.type = source["type"];
	        this.total_hours = source["total_hours"];
	        this.remaining_hours = source["remaining_hours"];
	        this.grace_threshold_percent = source["grace_threshold_percent"];
	        this.start_date = this.convertValues(source["start_date"], null);
	        this.end_date = this.convertValues(source["end_date"], null);
	        this.is_active = source["is_active"];
	        this.edges = this.convertValues(source["edges"], ContractEdges);
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
	export class DetectionEventEdges {
	    camera?: Camera;
	
	    static createFrom(source: any = {}) {
	        return new DetectionEventEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.camera = this.convertValues(source["camera"], Camera);
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
	export class DetectionEvent {
	    id?: number;
	    label?: string;
	    confidence?: number;
	    box?: Record<string, number>;
	    // Go type: time
	    timestamp?: any;
	    thumbnail_path?: string;
	    metadata?: Record<string, any>;
	    edges: DetectionEventEdges;
	
	    static createFrom(source: any = {}) {
	        return new DetectionEvent(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.label = source["label"];
	        this.confidence = source["confidence"];
	        this.box = source["box"];
	        this.timestamp = this.convertValues(source["timestamp"], null);
	        this.thumbnail_path = source["thumbnail_path"];
	        this.metadata = source["metadata"];
	        this.edges = this.convertValues(source["edges"], DetectionEventEdges);
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
	export class RecordingEdges {
	    camera?: Camera;
	
	    static createFrom(source: any = {}) {
	        return new RecordingEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.camera = this.convertValues(source["camera"], Camera);
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
	export class Recording {
	    id?: number;
	    path?: string;
	    // Go type: time
	    start_time?: any;
	    // Go type: time
	    end_time?: any;
	    size_bytes?: number;
	    type?: string;
	    edges: RecordingEdges;
	
	    static createFrom(source: any = {}) {
	        return new Recording(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.path = source["path"];
	        this.start_time = this.convertValues(source["start_time"], null);
	        this.end_time = this.convertValues(source["end_time"], null);
	        this.size_bytes = source["size_bytes"];
	        this.type = source["type"];
	        this.edges = this.convertValues(source["edges"], RecordingEdges);
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
	export class CameraEdges {
	    tenant?: Tenant;
	    recordings?: Recording[];
	    detections?: DetectionEvent[];
	
	    static createFrom(source: any = {}) {
	        return new CameraEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.recordings = this.convertValues(source["recordings"], Recording);
	        this.detections = this.convertValues(source["detections"], DetectionEvent);
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
	export class Camera {
	    id?: number;
	    name?: string;
	    rtsp_url?: string;
	    ip_address?: string;
	    onvif_port?: number;
	    username?: string;
	    // Go type: time
	    created_at?: any;
	    // Go type: time
	    updated_at?: any;
	    edges: CameraEdges;
	
	    static createFrom(source: any = {}) {
	        return new Camera(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.rtsp_url = source["rtsp_url"];
	        this.ip_address = source["ip_address"];
	        this.onvif_port = source["onvif_port"];
	        this.username = source["username"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	        this.edges = this.convertValues(source["edges"], CameraEdges);
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
	export class DiscoveryEntryEdges {
	    tenant?: Tenant;
	
	    static createFrom(source: any = {}) {
	        return new DiscoveryEntryEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
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
	export class DiscoveryEntry {
	    id?: number;
	    hardware_id?: string;
	    name?: string;
	    type?: string;
	    metadata?: Record<string, any>;
	    status?: string;
	    // Go type: time
	    discovered_at?: any;
	    edges: DiscoveryEntryEdges;
	
	    static createFrom(source: any = {}) {
	        return new DiscoveryEntry(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.hardware_id = source["hardware_id"];
	        this.name = source["name"];
	        this.type = source["type"];
	        this.metadata = source["metadata"];
	        this.status = source["status"];
	        this.discovered_at = this.convertValues(source["discovered_at"], null);
	        this.edges = this.convertValues(source["edges"], DiscoveryEntryEdges);
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
	export class AgentEdges {
	    tenant?: Tenant;
	
	    static createFrom(source: any = {}) {
	        return new AgentEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
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
	export class Agent {
	    id?: number;
	    hostname?: string;
	    os?: string;
	    arch?: string;
	    ip?: string;
	    mac?: string;
	    version?: string;
	    status?: string;
	    // Go type: time
	    last_seen?: any;
	    // Go type: time
	    created_at?: any;
	    // Go type: time
	    updated_at?: any;
	    edges: AgentEdges;
	
	    static createFrom(source: any = {}) {
	        return new Agent(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.hostname = source["hostname"];
	        this.os = source["os"];
	        this.arch = source["arch"];
	        this.ip = source["ip"];
	        this.mac = source["mac"];
	        this.version = source["version"];
	        this.status = source["status"];
	        this.last_seen = this.convertValues(source["last_seen"], null);
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	        this.edges = this.convertValues(source["edges"], AgentEdges);
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
	export class AuditLogEdges {
	    tenant?: Tenant;
	
	    static createFrom(source: any = {}) {
	        return new AuditLogEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
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
	export class AuditLog {
	    id?: number;
	    app_name?: string;
	    action?: string;
	    actor_id?: string;
	    remote_ip?: string;
	    payload?: Record<string, any>;
	    // Go type: time
	    timestamp?: any;
	    edges: AuditLogEdges;
	
	    static createFrom(source: any = {}) {
	        return new AuditLog(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.app_name = source["app_name"];
	        this.action = source["action"];
	        this.actor_id = source["actor_id"];
	        this.remote_ip = source["remote_ip"];
	        this.payload = source["payload"];
	        this.timestamp = this.convertValues(source["timestamp"], null);
	        this.edges = this.convertValues(source["edges"], AuditLogEdges);
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
	export class StockMovementEdges {
	    product?: Product;
	    tenant?: Tenant;
	
	    static createFrom(source: any = {}) {
	        return new StockMovementEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.product = this.convertValues(source["product"], Product);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
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
	export class StockMovement {
	    id?: number;
	    quantity?: number;
	    movement_type?: string;
	    reason?: string;
	    // Go type: time
	    created_at?: any;
	    edges: StockMovementEdges;
	
	    static createFrom(source: any = {}) {
	        return new StockMovement(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.quantity = source["quantity"];
	        this.movement_type = source["movement_type"];
	        this.reason = source["reason"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.edges = this.convertValues(source["edges"], StockMovementEdges);
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
	export class ProductEdges {
	    tenant?: Tenant;
	    movements?: StockMovement[];
	
	    static createFrom(source: any = {}) {
	        return new ProductEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.movements = this.convertValues(source["movements"], StockMovement);
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
	export class Product {
	    id?: number;
	    sku?: string;
	    name?: string;
	    description?: string;
	    unit_cost?: number;
	    quantity?: number;
	    // Go type: time
	    created_at?: any;
	    // Go type: time
	    updated_at?: any;
	    edges: ProductEdges;
	
	    static createFrom(source: any = {}) {
	        return new Product(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.sku = source["sku"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.unit_cost = source["unit_cost"];
	        this.quantity = source["quantity"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	        this.edges = this.convertValues(source["edges"], ProductEdges);
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
	export class LedgerEntryEdges {
	    transaction?: Transaction;
	    account?: Account;
	    tenant?: Tenant;
	
	    static createFrom(source: any = {}) {
	        return new LedgerEntryEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.transaction = this.convertValues(source["transaction"], Transaction);
	        this.account = this.convertValues(source["account"], Account);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
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
	export class LedgerEntry {
	    id?: number;
	    amount?: number;
	    direction?: string;
	    edges: LedgerEntryEdges;
	
	    static createFrom(source: any = {}) {
	        return new LedgerEntry(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.amount = source["amount"];
	        this.direction = source["direction"];
	        this.edges = this.convertValues(source["edges"], LedgerEntryEdges);
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
	export class TransactionEdges {
	    tenant?: Tenant;
	    entries?: LedgerEntry[];
	
	    static createFrom(source: any = {}) {
	        return new TransactionEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.entries = this.convertValues(source["entries"], LedgerEntry);
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
	export class Transaction {
	    id?: number;
	    description?: string;
	    reference?: string;
	    // Go type: time
	    date?: any;
	    // Go type: time
	    created_at?: any;
	    edges: TransactionEdges;
	
	    static createFrom(source: any = {}) {
	        return new Transaction(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.description = source["description"];
	        this.reference = source["reference"];
	        this.date = this.convertValues(source["date"], null);
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.edges = this.convertValues(source["edges"], TransactionEdges);
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
	export class SaaSUsageEdges {
	    identity?: SaaSIdentity;
	
	    static createFrom(source: any = {}) {
	        return new SaaSUsageEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.identity = this.convertValues(source["identity"], SaaSIdentity);
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
	export class SaaSUsage {
	    id?: number;
	    // Go type: time
	    timestamp?: any;
	    feature_name?: string;
	    count?: number;
	    metadata?: Record<string, any>;
	    edges: SaaSUsageEdges;
	
	    static createFrom(source: any = {}) {
	        return new SaaSUsage(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.timestamp = this.convertValues(source["timestamp"], null);
	        this.feature_name = source["feature_name"];
	        this.count = source["count"];
	        this.metadata = source["metadata"];
	        this.edges = this.convertValues(source["edges"], SaaSUsageEdges);
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
	export class SaaSFilterEdges {
	    app?: SaaSApp;
	    tenant?: Tenant;
	
	    static createFrom(source: any = {}) {
	        return new SaaSFilterEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.app = this.convertValues(source["app"], SaaSApp);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
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
	export class SaaSFilter {
	    id?: number;
	    domain_pattern?: string;
	    action?: string;
	    reason?: string;
	    is_sni_based?: boolean;
	    // Go type: time
	    created_at?: any;
	    // Go type: time
	    updated_at?: any;
	    edges: SaaSFilterEdges;
	
	    static createFrom(source: any = {}) {
	        return new SaaSFilter(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.domain_pattern = source["domain_pattern"];
	        this.action = source["action"];
	        this.reason = source["reason"];
	        this.is_sni_based = source["is_sni_based"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	        this.edges = this.convertValues(source["edges"], SaaSFilterEdges);
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
	export class SaaSAppEdges {
	    identities?: SaaSIdentity[];
	    filters?: SaaSFilter[];
	    tenant?: Tenant;
	
	    static createFrom(source: any = {}) {
	        return new SaaSAppEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.identities = this.convertValues(source["identities"], SaaSIdentity);
	        this.filters = this.convertValues(source["filters"], SaaSFilter);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
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
	export class SaaSApp {
	    id?: number;
	    name?: string;
	    provider?: string;
	    category?: string;
	    url?: string;
	    is_managed?: boolean;
	    config?: Record<string, any>;
	    // Go type: time
	    created_at?: any;
	    // Go type: time
	    updated_at?: any;
	    edges: SaaSAppEdges;
	
	    static createFrom(source: any = {}) {
	        return new SaaSApp(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.provider = source["provider"];
	        this.category = source["category"];
	        this.url = source["url"];
	        this.is_managed = source["is_managed"];
	        this.config = source["config"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	        this.edges = this.convertValues(source["edges"], SaaSAppEdges);
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
	export class SaaSIdentityEdges {
	    user?: User;
	    app?: SaaSApp;
	    usages?: SaaSUsage[];
	
	    static createFrom(source: any = {}) {
	        return new SaaSIdentityEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.user = this.convertValues(source["user"], User);
	        this.app = this.convertValues(source["app"], SaaSApp);
	        this.usages = this.convertValues(source["usages"], SaaSUsage);
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
	export class SaaSIdentity {
	    id?: number;
	    external_id?: string;
	    email?: string;
	    display_name?: string;
	    current_plan?: string;
	    metadata?: Record<string, any>;
	    mfa_enabled?: boolean;
	    // Go type: time
	    last_login?: any;
	    // Go type: time
	    created_at?: any;
	    // Go type: time
	    updated_at?: any;
	    edges: SaaSIdentityEdges;
	
	    static createFrom(source: any = {}) {
	        return new SaaSIdentity(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.external_id = source["external_id"];
	        this.email = source["email"];
	        this.display_name = source["display_name"];
	        this.current_plan = source["current_plan"];
	        this.metadata = source["metadata"];
	        this.mfa_enabled = source["mfa_enabled"];
	        this.last_login = this.convertValues(source["last_login"], null);
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	        this.edges = this.convertValues(source["edges"], SaaSIdentityEdges);
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
	export class VoicemailEdges {
	    tenant?: Tenant;
	    user?: User;
	
	    static createFrom(source: any = {}) {
	        return new VoicemailEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.user = this.convertValues(source["user"], User);
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
	export class Voicemail {
	    id?: number;
	    caller?: string;
	    audio_path?: string;
	    transcription?: string;
	    // Go type: time
	    created_at?: any;
	    // Go type: time
	    read_at?: any;
	    edges: VoicemailEdges;
	
	    static createFrom(source: any = {}) {
	        return new Voicemail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.caller = source["caller"];
	        this.audio_path = source["audio_path"];
	        this.transcription = source["transcription"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.read_at = this.convertValues(source["read_at"], null);
	        this.edges = this.convertValues(source["edges"], VoicemailEdges);
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
	export class CallLogEdges {
	    tenant?: Tenant;
	    user?: User;
	
	    static createFrom(source: any = {}) {
	        return new CallLogEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.user = this.convertValues(source["user"], User);
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
	export class CallLog {
	    id?: number;
	    caller?: string;
	    callee?: string;
	    direction?: string;
	    // Go type: time
	    start_time?: any;
	    // Go type: time
	    end_time?: any;
	    duration?: number;
	    status?: string;
	    recording_path?: string;
	    transcript?: string;
	    edges: CallLogEdges;
	
	    static createFrom(source: any = {}) {
	        return new CallLog(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.caller = source["caller"];
	        this.callee = source["callee"];
	        this.direction = source["direction"];
	        this.start_time = this.convertValues(source["start_time"], null);
	        this.end_time = this.convertValues(source["end_time"], null);
	        this.duration = source["duration"];
	        this.status = source["status"];
	        this.recording_path = source["recording_path"];
	        this.transcript = source["transcript"];
	        this.edges = this.convertValues(source["edges"], CallLogEdges);
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
	export class RemediationStepEdges {
	    ticket?: Ticket;
	
	    static createFrom(source: any = {}) {
	        return new RemediationStepEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ticket = this.convertValues(source["ticket"], Ticket);
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
	export class RemediationStep {
	    id?: number;
	    action_name?: string;
	    sequence?: number;
	    status?: string;
	    output?: string;
	    execution_context?: Record<string, any>;
	    edges: RemediationStepEdges;
	
	    static createFrom(source: any = {}) {
	        return new RemediationStep(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.action_name = source["action_name"];
	        this.sequence = source["sequence"];
	        this.status = source["status"];
	        this.output = source["output"];
	        this.execution_context = source["execution_context"];
	        this.edges = this.convertValues(source["edges"], RemediationStepEdges);
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
	export class TimeEntryEdges {
	    ticket?: Ticket;
	    technician?: User;
	
	    static createFrom(source: any = {}) {
	        return new TimeEntryEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ticket = this.convertValues(source["ticket"], Ticket);
	        this.technician = this.convertValues(source["technician"], User);
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
	export class TimeEntry {
	    id?: number;
	    duration_hours?: number;
	    note?: string;
	    // Go type: time
	    started_at?: any;
	    is_billable?: boolean;
	    edges: TimeEntryEdges;
	
	    static createFrom(source: any = {}) {
	        return new TimeEntry(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.duration_hours = source["duration_hours"];
	        this.note = source["note"];
	        this.started_at = this.convertValues(source["started_at"], null);
	        this.is_billable = source["is_billable"];
	        this.edges = this.convertValues(source["edges"], TimeEntryEdges);
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
	export class SOPEdges {
	    tenant?: Tenant;
	    asset?: Asset;
	    author?: User;
	
	    static createFrom(source: any = {}) {
	        return new SOPEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.asset = this.convertValues(source["asset"], Asset);
	        this.author = this.convertValues(source["author"], User);
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
	export class SOP {
	    id?: number;
	    title?: string;
	    content?: Record<string, any>;
	    version?: number;
	    // Go type: time
	    created_at?: any;
	    // Go type: time
	    updated_at?: any;
	    edges: SOPEdges;
	
	    static createFrom(source: any = {}) {
	        return new SOP(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.title = source["title"];
	        this.content = source["content"];
	        this.version = source["version"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	        this.edges = this.convertValues(source["edges"], SOPEdges);
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
	export class OneTimeLinkEdges {
	    credential?: Credential;
	    tenant?: Tenant;
	
	    static createFrom(source: any = {}) {
	        return new OneTimeLinkEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.credential = this.convertValues(source["credential"], Credential);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
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
	export class OneTimeLink {
	    id?: number;
	    tenant_id?: number;
	    credential_id?: number;
	    token?: string;
	    // Go type: time
	    expires_at?: any;
	    consumed?: boolean;
	    // Go type: time
	    created_at?: any;
	    edges: OneTimeLinkEdges;
	
	    static createFrom(source: any = {}) {
	        return new OneTimeLink(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.tenant_id = source["tenant_id"];
	        this.credential_id = source["credential_id"];
	        this.token = source["token"];
	        this.expires_at = this.convertValues(source["expires_at"], null);
	        this.consumed = source["consumed"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.edges = this.convertValues(source["edges"], OneTimeLinkEdges);
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
	export class CredentialEdges {
	    tenant?: Tenant;
	    asset?: Asset;
	    one_time_links?: OneTimeLink[];
	
	    static createFrom(source: any = {}) {
	        return new CredentialEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.asset = this.convertValues(source["asset"], Asset);
	        this.one_time_links = this.convertValues(source["one_time_links"], OneTimeLink);
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
	export class Credential {
	    id?: number;
	    name?: string;
	    username?: string;
	    password_encrypted?: number[];
	    // Go type: time
	    last_revealed_at?: any;
	    // Go type: time
	    created_at?: any;
	    edges: CredentialEdges;
	
	    static createFrom(source: any = {}) {
	        return new Credential(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.username = source["username"];
	        this.password_encrypted = source["password_encrypted"];
	        this.last_revealed_at = this.convertValues(source["last_revealed_at"], null);
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.edges = this.convertValues(source["edges"], CredentialEdges);
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
	export class AssetTypeEdges {
	    assets?: Asset[];
	
	    static createFrom(source: any = {}) {
	        return new AssetTypeEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.assets = this.convertValues(source["assets"], Asset);
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
	export class AssetType {
	    id?: number;
	    name?: string;
	    description?: string;
	    edges: AssetTypeEdges;
	
	    static createFrom(source: any = {}) {
	        return new AssetType(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.edges = this.convertValues(source["edges"], AssetTypeEdges);
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
	export class AssetEdges {
	    tenant?: Tenant;
	    type?: AssetType;
	    hosted_at?: Asset;
	    hosted_assets?: Asset[];
	    dependency_of?: Asset[];
	    depends_on?: Asset[];
	    owner?: User;
	    credentials?: Credential[];
	    sops?: SOP[];
	    tickets?: Ticket[];
	
	    static createFrom(source: any = {}) {
	        return new AssetEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.type = this.convertValues(source["type"], AssetType);
	        this.hosted_at = this.convertValues(source["hosted_at"], Asset);
	        this.hosted_assets = this.convertValues(source["hosted_assets"], Asset);
	        this.dependency_of = this.convertValues(source["dependency_of"], Asset);
	        this.depends_on = this.convertValues(source["depends_on"], Asset);
	        this.owner = this.convertValues(source["owner"], User);
	        this.credentials = this.convertValues(source["credentials"], Credential);
	        this.sops = this.convertValues(source["sops"], SOP);
	        this.tickets = this.convertValues(source["tickets"], Ticket);
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
	export class Asset {
	    id?: number;
	    name?: string;
	    hardware_id?: string;
	    metadata?: Record<string, any>;
	    // Go type: time
	    last_certified_at?: any;
	    // Go type: time
	    created_at?: any;
	    // Go type: time
	    updated_at?: any;
	    edges: AssetEdges;
	
	    static createFrom(source: any = {}) {
	        return new Asset(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.hardware_id = source["hardware_id"];
	        this.metadata = source["metadata"];
	        this.last_certified_at = this.convertValues(source["last_certified_at"], null);
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	        this.edges = this.convertValues(source["edges"], AssetEdges);
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
	export class TicketEdges {
	    tenant?: Tenant;
	    requester?: User;
	    assignee?: User;
	    asset?: Asset;
	    time_entries?: TimeEntry[];
	    remediation_steps?: RemediationStep[];
	
	    static createFrom(source: any = {}) {
	        return new TicketEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.requester = this.convertValues(source["requester"], User);
	        this.assignee = this.convertValues(source["assignee"], User);
	        this.asset = this.convertValues(source["asset"], Asset);
	        this.time_entries = this.convertValues(source["time_entries"], TimeEntry);
	        this.remediation_steps = this.convertValues(source["remediation_steps"], RemediationStep);
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
	export class Ticket {
	    id?: number;
	    subject?: string;
	    description?: string;
	    status?: string;
	    priority?: string;
	    metadata?: string;
	    // Go type: time
	    created_at?: any;
	    // Go type: time
	    updated_at?: any;
	    // Go type: time
	    resolved_at?: any;
	    // Go type: time
	    due_date?: any;
	    claim_lease_owner?: string;
	    // Go type: time
	    claim_lease_expires_at?: any;
	    edges: TicketEdges;
	
	    static createFrom(source: any = {}) {
	        return new Ticket(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.subject = source["subject"];
	        this.description = source["description"];
	        this.status = source["status"];
	        this.priority = source["priority"];
	        this.metadata = source["metadata"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	        this.resolved_at = this.convertValues(source["resolved_at"], null);
	        this.due_date = this.convertValues(source["due_date"], null);
	        this.claim_lease_owner = source["claim_lease_owner"];
	        this.claim_lease_expires_at = this.convertValues(source["claim_lease_expires_at"], null);
	        this.edges = this.convertValues(source["edges"], TicketEdges);
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
	export class PermissionEdges {
	    users?: User[];
	
	    static createFrom(source: any = {}) {
	        return new PermissionEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.users = this.convertValues(source["users"], User);
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
	export class Permission {
	    id?: number;
	    name?: string;
	    code?: string;
	    edges: PermissionEdges;
	
	    static createFrom(source: any = {}) {
	        return new Permission(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.code = source["code"];
	        this.edges = this.convertValues(source["edges"], PermissionEdges);
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
	export class UserEdges {
	    tenant?: Tenant;
	    permissions?: Permission[];
	    requested_tickets?: Ticket[];
	    assigned_tickets?: Ticket[];
	    time_entries?: TimeEntry[];
	    owned_assets?: Asset[];
	    authored_sops?: SOP[];
	    call_logs?: CallLog[];
	    voicemails?: Voicemail[];
	    saas_identities?: SaaSIdentity[];
	
	    static createFrom(source: any = {}) {
	        return new UserEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.permissions = this.convertValues(source["permissions"], Permission);
	        this.requested_tickets = this.convertValues(source["requested_tickets"], Ticket);
	        this.assigned_tickets = this.convertValues(source["assigned_tickets"], Ticket);
	        this.time_entries = this.convertValues(source["time_entries"], TimeEntry);
	        this.owned_assets = this.convertValues(source["owned_assets"], Asset);
	        this.authored_sops = this.convertValues(source["authored_sops"], SOP);
	        this.call_logs = this.convertValues(source["call_logs"], CallLog);
	        this.voicemails = this.convertValues(source["voicemails"], Voicemail);
	        this.saas_identities = this.convertValues(source["saas_identities"], SaaSIdentity);
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
	export class User {
	    id?: number;
	    zitadel_id?: string;
	    email?: string;
	    first_name?: string;
	    last_name?: string;
	    job_title?: string;
	    department?: string;
	    external_mappings?: Record<string, any>;
	    // Go type: time
	    created_at?: any;
	    role?: string;
	    seniority?: string;
	    max_wip?: number;
	    edges: UserEdges;
	
	    static createFrom(source: any = {}) {
	        return new User(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.zitadel_id = source["zitadel_id"];
	        this.email = source["email"];
	        this.first_name = source["first_name"];
	        this.last_name = source["last_name"];
	        this.job_title = source["job_title"];
	        this.department = source["department"];
	        this.external_mappings = source["external_mappings"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.role = source["role"];
	        this.seniority = source["seniority"];
	        this.max_wip = source["max_wip"];
	        this.edges = this.convertValues(source["edges"], UserEdges);
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
	export class TenantEdges {
	    users?: User[];
	    accounts?: Account[];
	    transactions?: Transaction[];
	    ledger_entries?: LedgerEntry[];
	    products?: Product[];
	    stock_movements?: StockMovement[];
	    audit_logs?: AuditLog[];
	    agents?: Agent[];
	    discovery_entries?: DiscoveryEntry[];
	    assets?: Asset[];
	    credentials?: Credential[];
	    one_time_links?: OneTimeLink[];
	    sops?: SOP[];
	    cameras?: Camera[];
	    tickets?: Ticket[];
	    contracts?: Contract[];
	    saas_apps?: SaaSApp[];
	    saas_filters?: SaaSFilter[];
	    call_logs?: CallLog[];
	    ivr_flows?: IVRFlow[];
	    voicemails?: Voicemail[];
	    health_snapshots?: HealthScoreSnapshot[];
	    roadmaps?: StrategicRoadmap[];
	    budget_forecasts?: BudgetForecast[];
	    employees?: Employee[];
	    compensation_agreements?: CompensationAgreement[];
	
	    static createFrom(source: any = {}) {
	        return new TenantEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.users = this.convertValues(source["users"], User);
	        this.accounts = this.convertValues(source["accounts"], Account);
	        this.transactions = this.convertValues(source["transactions"], Transaction);
	        this.ledger_entries = this.convertValues(source["ledger_entries"], LedgerEntry);
	        this.products = this.convertValues(source["products"], Product);
	        this.stock_movements = this.convertValues(source["stock_movements"], StockMovement);
	        this.audit_logs = this.convertValues(source["audit_logs"], AuditLog);
	        this.agents = this.convertValues(source["agents"], Agent);
	        this.discovery_entries = this.convertValues(source["discovery_entries"], DiscoveryEntry);
	        this.assets = this.convertValues(source["assets"], Asset);
	        this.credentials = this.convertValues(source["credentials"], Credential);
	        this.one_time_links = this.convertValues(source["one_time_links"], OneTimeLink);
	        this.sops = this.convertValues(source["sops"], SOP);
	        this.cameras = this.convertValues(source["cameras"], Camera);
	        this.tickets = this.convertValues(source["tickets"], Ticket);
	        this.contracts = this.convertValues(source["contracts"], Contract);
	        this.saas_apps = this.convertValues(source["saas_apps"], SaaSApp);
	        this.saas_filters = this.convertValues(source["saas_filters"], SaaSFilter);
	        this.call_logs = this.convertValues(source["call_logs"], CallLog);
	        this.ivr_flows = this.convertValues(source["ivr_flows"], IVRFlow);
	        this.voicemails = this.convertValues(source["voicemails"], Voicemail);
	        this.health_snapshots = this.convertValues(source["health_snapshots"], HealthScoreSnapshot);
	        this.roadmaps = this.convertValues(source["roadmaps"], StrategicRoadmap);
	        this.budget_forecasts = this.convertValues(source["budget_forecasts"], BudgetForecast);
	        this.employees = this.convertValues(source["employees"], Employee);
	        this.compensation_agreements = this.convertValues(source["compensation_agreements"], CompensationAgreement);
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
	export class Tenant {
	    id?: number;
	    name?: string;
	    domain?: string;
	    // Go type: time
	    created_at?: any;
	    active?: boolean;
	    edges: TenantEdges;
	
	    static createFrom(source: any = {}) {
	        return new Tenant(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.domain = source["domain"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.active = source["active"];
	        this.edges = this.convertValues(source["edges"], TenantEdges);
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
	export class AccountEdges {
	    tenant?: Tenant;
	    entries?: LedgerEntry[];
	
	    static createFrom(source: any = {}) {
	        return new AccountEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.entries = this.convertValues(source["entries"], LedgerEntry);
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
	export class Account {
	    id?: number;
	    name?: string;
	    number?: string;
	    type?: string;
	    balance?: number;
	    // Go type: time
	    created_at?: any;
	    edges: AccountEdges;
	
	    static createFrom(source: any = {}) {
	        return new Account(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.number = source["number"];
	        this.type = source["type"];
	        this.balance = source["balance"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.edges = this.convertValues(source["edges"], AccountEdges);
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

export namespace impact {
	
	export class ImpactNode {
	    ID: number;
	    Name: string;
	    Type: string;
	    Depth: number;
	
	    static createFrom(source: any = {}) {
	        return new ImpactNode(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.Name = source["Name"];
	        this.Type = source["Type"];
	        this.Depth = source["Depth"];
	    }
	}

}

export namespace optic {
	
	export class CameraDTO {
	    id: number;
	    name: string;
	    rtspUrl: string;
	    ip: string;
	
	    static createFrom(source: any = {}) {
	        return new CameraDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.rtspUrl = source["rtspUrl"];
	        this.ip = source["ip"];
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
	    // Go type: time
	    createdAt: any;
	
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
	        this.createdAt = this.convertValues(source["createdAt"], null);
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

export namespace stock {
	
	export class ProductDTO {
	    id: number;
	    sku: string;
	    name: string;
	    description: string;
	    unitCost: number;
	    quantity: number;
	
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
	    }
	}
	export class SaleItem {
	    productId: number;
	    quantity: number;
	    price: number;
	
	    static createFrom(source: any = {}) {
	        return new SaleItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.productId = source["productId"];
	        this.quantity = source["quantity"];
	        this.price = source["price"];
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
	
	    static createFrom(source: any = {}) {
	        return new StockAdjustment(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.productId = source["productId"];
	        this.quantity = source["quantity"];
	        this.type = source["type"];
	        this.reason = source["reason"];
	    }
	}
	export class StockMovementDTO {
	    id: number;
	    type: string;
	    quantity: number;
	    reason: string;
	    // Go type: time
	    date: any;
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
	        this.date = this.convertValues(source["date"], null);
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

}

export namespace tax {
	
	export class TaxConfig {
	    countryCode: string;
	    defaultRate: number;
	    isFiscal: boolean;
	
	    static createFrom(source: any = {}) {
	        return new TaxConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.countryCode = source["countryCode"];
	        this.defaultRate = source["defaultRate"];
	        this.isFiscal = source["isFiscal"];
	    }
	}
	export class TaxResult {
	    subtotal: number;
	    taxRate: number;
	    taxAmount: number;
	    total: number;
	
	    static createFrom(source: any = {}) {
	        return new TaxResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.subtotal = source["subtotal"];
	        this.taxRate = source["taxRate"];
	        this.taxAmount = source["taxAmount"];
	        this.total = source["total"];
	    }
	}

}

export namespace vault {
	
	export class FileDTO {
	    name: string;
	    path: string;
	    size: number;
	    // Go type: time
	    modTime: any;
	    isDir: boolean;
	
	    static createFrom(source: any = {}) {
	        return new FileDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.path = source["path"];
	        this.size = source["size"];
	        this.modTime = this.convertValues(source["modTime"], null);
	        this.isDir = source["isDir"];
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
	export class RevealRequest {
	    CredentialID: number;
	    TenantID: number;
	    ActorID: string;
	    ReasonCode: string;
	    TicketID: string;
	    Action: string;
	
	    static createFrom(source: any = {}) {
	        return new RevealRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.CredentialID = source["CredentialID"];
	        this.TenantID = source["TenantID"];
	        this.ActorID = source["ActorID"];
	        this.ReasonCode = source["ReasonCode"];
	        this.TicketID = source["TicketID"];
	        this.Action = source["Action"];
	    }
	}

}

