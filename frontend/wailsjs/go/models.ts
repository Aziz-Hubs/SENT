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

export namespace agent {
	
	export class FileInfo {
	    name: string;
	    size: number;
	    mode: string;
	    // Go type: time
	    modTime: any;
	    isDir: boolean;
	
	    static createFrom(source: any = {}) {
	        return new FileInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.size = source["size"];
	        this.mode = source["mode"];
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
	export class PatchInfo {
	    id: string;
	    title: string;
	    severity: string;
	    size: number;
	    published: string;
	    installed: boolean;
	
	    static createFrom(source: any = {}) {
	        return new PatchInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.title = source["title"];
	        this.severity = source["severity"];
	        this.size = source["size"];
	        this.published = source["published"];
	        this.installed = source["installed"];
	    }
	}
	export class ServiceInfo {
	    name: string;
	    displayName: string;
	    status: string;
	
	    static createFrom(source: any = {}) {
	        return new ServiceInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.displayName = source["displayName"];
	        this.status = source["status"];
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

export namespace bridge {
	
	export class JobDTO {
	    id: number;
	    name: string;
	    schedule: string;
	    targets: string[];
	    script_name: string;
	    script_id: number;
	    last_run: string;
	    next_run: string;
	
	    static createFrom(source: any = {}) {
	        return new JobDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.schedule = source["schedule"];
	        this.targets = source["targets"];
	        this.script_name = source["script_name"];
	        this.script_id = source["script_id"];
	        this.last_run = source["last_run"];
	        this.next_run = source["next_run"];
	    }
	}
	export class ScriptDTO {
	    id: number;
	    name: string;
	    description: string;
	    content: string;
	    type: string;
	
	    static createFrom(source: any = {}) {
	        return new ScriptDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.content = source["content"];
	        this.type = source["type"];
	    }
	}
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
	export class TransactionRequest {
	    description: string;
	    // Go type: time
	    date: any;
	    entries: EntryRequest[];
	    user_id: number;
	
	    static createFrom(source: any = {}) {
	        return new TransactionRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.description = source["description"];
	        this.date = this.convertValues(source["date"], null);
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

export namespace control {
	
	export class ControlOrchestrator {
	
	
	    static createFrom(source: any = {}) {
	        return new ControlOrchestrator(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	
	    }
	}
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
	
	export class NexusAuditEdges {
	    tenant?: Tenant;
	
	    static createFrom(source: any = {}) {
	        return new NexusAuditEdges(source);
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
	export class NexusAudit {
	    id?: number;
	    action?: string;
	    actor_id?: string;
	    credential_id?: string;
	    reason_code?: string;
	    ticket_id?: string;
	    // Go type: time
	    timestamp?: any;
	    metadata?: Record<string, any>;
	    edges: NexusAuditEdges;
	
	    static createFrom(source: any = {}) {
	        return new NexusAudit(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.action = source["action"];
	        this.actor_id = source["actor_id"];
	        this.credential_id = source["credential_id"];
	        this.reason_code = source["reason_code"];
	        this.ticket_id = source["ticket_id"];
	        this.timestamp = this.convertValues(source["timestamp"], null);
	        this.metadata = source["metadata"];
	        this.edges = this.convertValues(source["edges"], NexusAuditEdges);
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
	export class RecurringInvoiceEdges {
	    tenant?: Tenant;
	    account?: Account;
	
	    static createFrom(source: any = {}) {
	        return new RecurringInvoiceEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.account = this.convertValues(source["account"], Account);
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
	export class RecurringInvoice {
	    id?: number;
	    description?: string;
	    // Go type: decimal
	    amount?: any;
	    currency?: string;
	    frequency?: string;
	    // Go type: time
	    next_run_date?: any;
	    // Go type: time
	    last_run_date?: any;
	    is_active?: boolean;
	    // Go type: time
	    created_at?: any;
	    edges: RecurringInvoiceEdges;
	
	    static createFrom(source: any = {}) {
	        return new RecurringInvoice(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.description = source["description"];
	        this.amount = this.convertValues(source["amount"], null);
	        this.currency = source["currency"];
	        this.frequency = source["frequency"];
	        this.next_run_date = this.convertValues(source["next_run_date"], null);
	        this.last_run_date = this.convertValues(source["last_run_date"], null);
	        this.is_active = source["is_active"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.edges = this.convertValues(source["edges"], RecurringInvoiceEdges);
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
	export class VaultItemEdges {
	    tenant?: Tenant;
	
	    static createFrom(source: any = {}) {
	        return new VaultItemEdges(source);
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
	export class VaultItem {
	    id?: number;
	    path?: string;
	    name?: string;
	    size?: number;
	    hash?: string;
	    file_type?: string;
	    encrypted?: boolean;
	    metadata?: Record<string, any>;
	    content?: string;
	    is_dir?: boolean;
	    // Go type: time
	    created_at?: any;
	    // Go type: time
	    updated_at?: any;
	    edges: VaultItemEdges;
	
	    static createFrom(source: any = {}) {
	        return new VaultItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.path = source["path"];
	        this.name = source["name"];
	        this.size = source["size"];
	        this.hash = source["hash"];
	        this.file_type = source["file_type"];
	        this.encrypted = source["encrypted"];
	        this.metadata = source["metadata"];
	        this.content = source["content"];
	        this.is_dir = source["is_dir"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	        this.edges = this.convertValues(source["edges"], VaultItemEdges);
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
	export class GoalEdges {
	    tenant?: Tenant;
	    employee?: Employee;
	
	    static createFrom(source: any = {}) {
	        return new GoalEdges(source);
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
	export class Goal {
	    id?: number;
	    title?: string;
	    description?: string;
	    category?: string;
	    status?: string;
	    progress?: number;
	    // Go type: time
	    target_date?: any;
	    key_results?: string;
	    manager_notes?: string;
	    // Go type: time
	    completed_at?: any;
	    // Go type: time
	    created_at?: any;
	    // Go type: time
	    updated_at?: any;
	    edges: GoalEdges;
	
	    static createFrom(source: any = {}) {
	        return new Goal(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.title = source["title"];
	        this.description = source["description"];
	        this.category = source["category"];
	        this.status = source["status"];
	        this.progress = source["progress"];
	        this.target_date = this.convertValues(source["target_date"], null);
	        this.key_results = source["key_results"];
	        this.manager_notes = source["manager_notes"];
	        this.completed_at = this.convertValues(source["completed_at"], null);
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	        this.edges = this.convertValues(source["edges"], GoalEdges);
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
	export class ReviewCycleEdges {
	    tenant?: Tenant;
	    reviews?: PerformanceReview[];
	
	    static createFrom(source: any = {}) {
	        return new ReviewCycleEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.reviews = this.convertValues(source["reviews"], PerformanceReview);
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
	export class ReviewCycle {
	    id?: number;
	    name?: string;
	    description?: string;
	    cycle_type?: string;
	    status?: string;
	    // Go type: time
	    start_date?: any;
	    // Go type: time
	    end_date?: any;
	    // Go type: time
	    review_deadline?: any;
	    // Go type: time
	    created_at?: any;
	    // Go type: time
	    updated_at?: any;
	    edges: ReviewCycleEdges;
	
	    static createFrom(source: any = {}) {
	        return new ReviewCycle(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.cycle_type = source["cycle_type"];
	        this.status = source["status"];
	        this.start_date = this.convertValues(source["start_date"], null);
	        this.end_date = this.convertValues(source["end_date"], null);
	        this.review_deadline = this.convertValues(source["review_deadline"], null);
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	        this.edges = this.convertValues(source["edges"], ReviewCycleEdges);
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
	export class PerformanceReviewEdges {
	    tenant?: Tenant;
	    employee?: Employee;
	    reviewer?: Employee;
	    cycle?: ReviewCycle;
	
	    static createFrom(source: any = {}) {
	        return new PerformanceReviewEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.employee = this.convertValues(source["employee"], Employee);
	        this.reviewer = this.convertValues(source["reviewer"], Employee);
	        this.cycle = this.convertValues(source["cycle"], ReviewCycle);
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
	export class PerformanceReview {
	    id?: number;
	    overall_rating?: string;
	    strengths?: string;
	    areas_for_improvement?: string;
	    manager_comments?: string;
	    goals_assessment?: Record<string, any>;
	    status?: string;
	    // Go type: time
	    submitted_at?: any;
	    // Go type: time
	    acknowledged_at?: any;
	    // Go type: time
	    created_at?: any;
	    // Go type: time
	    updated_at?: any;
	    edges: PerformanceReviewEdges;
	
	    static createFrom(source: any = {}) {
	        return new PerformanceReview(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.overall_rating = source["overall_rating"];
	        this.strengths = source["strengths"];
	        this.areas_for_improvement = source["areas_for_improvement"];
	        this.manager_comments = source["manager_comments"];
	        this.goals_assessment = source["goals_assessment"];
	        this.status = source["status"];
	        this.submitted_at = this.convertValues(source["submitted_at"], null);
	        this.acknowledged_at = this.convertValues(source["acknowledged_at"], null);
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	        this.edges = this.convertValues(source["edges"], PerformanceReviewEdges);
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
	export class TimeOffPolicyEdges {
	    tenant?: Tenant;
	    balances?: TimeOffBalance[];
	
	    static createFrom(source: any = {}) {
	        return new TimeOffPolicyEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.balances = this.convertValues(source["balances"], TimeOffBalance);
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
	export class TimeOffPolicy {
	    id?: number;
	    name?: string;
	    description?: string;
	    policy_type?: string;
	    leave_type?: string;
	    annual_allowance?: number;
	    accrual_rate?: number;
	    carry_over_max?: number;
	    requires_approval?: boolean;
	    min_notice_days?: number;
	    is_active?: boolean;
	    // Go type: time
	    created_at?: any;
	    // Go type: time
	    updated_at?: any;
	    edges: TimeOffPolicyEdges;
	
	    static createFrom(source: any = {}) {
	        return new TimeOffPolicy(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.policy_type = source["policy_type"];
	        this.leave_type = source["leave_type"];
	        this.annual_allowance = source["annual_allowance"];
	        this.accrual_rate = source["accrual_rate"];
	        this.carry_over_max = source["carry_over_max"];
	        this.requires_approval = source["requires_approval"];
	        this.min_notice_days = source["min_notice_days"];
	        this.is_active = source["is_active"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	        this.edges = this.convertValues(source["edges"], TimeOffPolicyEdges);
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
	export class TimeOffBalanceEdges {
	    tenant?: Tenant;
	    employee?: Employee;
	    policy?: TimeOffPolicy;
	
	    static createFrom(source: any = {}) {
	        return new TimeOffBalanceEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.employee = this.convertValues(source["employee"], Employee);
	        this.policy = this.convertValues(source["policy"], TimeOffPolicy);
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
	export class TimeOffBalance {
	    id?: number;
	    year?: number;
	    available_hours?: number;
	    used_hours?: number;
	    pending_hours?: number;
	    accrued_hours?: number;
	    carried_over_hours?: number;
	    // Go type: time
	    created_at?: any;
	    // Go type: time
	    updated_at?: any;
	    edges: TimeOffBalanceEdges;
	
	    static createFrom(source: any = {}) {
	        return new TimeOffBalance(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.year = source["year"];
	        this.available_hours = source["available_hours"];
	        this.used_hours = source["used_hours"];
	        this.pending_hours = source["pending_hours"];
	        this.accrued_hours = source["accrued_hours"];
	        this.carried_over_hours = source["carried_over_hours"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	        this.edges = this.convertValues(source["edges"], TimeOffBalanceEdges);
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
	export class TimeOffRequestEdges {
	    tenant?: Tenant;
	    employee?: Employee;
	    approved_by?: Employee;
	
	    static createFrom(source: any = {}) {
	        return new TimeOffRequestEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.employee = this.convertValues(source["employee"], Employee);
	        this.approved_by = this.convertValues(source["approved_by"], Employee);
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
	export class TimeOffRequest {
	    id?: number;
	    request_type?: string;
	    // Go type: time
	    start_date?: any;
	    // Go type: time
	    end_date?: any;
	    requested_hours?: number;
	    status?: string;
	    notes?: string;
	    rejection_reason?: string;
	    // Go type: time
	    reviewed_at?: any;
	    // Go type: time
	    created_at?: any;
	    // Go type: time
	    updated_at?: any;
	    edges: TimeOffRequestEdges;
	
	    static createFrom(source: any = {}) {
	        return new TimeOffRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.request_type = source["request_type"];
	        this.start_date = this.convertValues(source["start_date"], null);
	        this.end_date = this.convertValues(source["end_date"], null);
	        this.requested_hours = source["requested_hours"];
	        this.status = source["status"];
	        this.notes = source["notes"];
	        this.rejection_reason = source["rejection_reason"];
	        this.reviewed_at = this.convertValues(source["reviewed_at"], null);
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	        this.edges = this.convertValues(source["edges"], TimeOffRequestEdges);
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
	export class SuccessionMapEdges {
	    employee?: Employee;
	    backup_candidate?: Employee;
	    tenant?: Tenant;
	
	    static createFrom(source: any = {}) {
	        return new SuccessionMapEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.employee = this.convertValues(source["employee"], Employee);
	        this.backup_candidate = this.convertValues(source["backup_candidate"], Employee);
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
	    // Go type: decimal
	    base_salary?: any;
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
	        this.base_salary = this.convertValues(source["base_salary"], null);
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
	    tenant?: Tenant;
	
	    static createFrom(source: any = {}) {
	        return new DepartmentEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.parent = this.convertValues(source["parent"], Department);
	        this.children = this.convertValues(source["children"], Department);
	        this.members = this.convertValues(source["members"], Employee);
	        this.head = this.convertValues(source["head"], Employee);
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
	    expense_account?: Account;
	    time_off_requests?: TimeOffRequest[];
	    approved_time_off?: TimeOffRequest[];
	    time_off_balances?: TimeOffBalance[];
	    performance_reviews?: PerformanceReview[];
	    conducted_reviews?: PerformanceReview[];
	    goals?: Goal[];
	
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
	        this.expense_account = this.convertValues(source["expense_account"], Account);
	        this.time_off_requests = this.convertValues(source["time_off_requests"], TimeOffRequest);
	        this.approved_time_off = this.convertValues(source["approved_time_off"], TimeOffRequest);
	        this.time_off_balances = this.convertValues(source["time_off_balances"], TimeOffBalance);
	        this.performance_reviews = this.convertValues(source["performance_reviews"], PerformanceReview);
	        this.conducted_reviews = this.convertValues(source["conducted_reviews"], PerformanceReview);
	        this.goals = this.convertValues(source["goals"], Goal);
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
	    // Go type: decimal
	    projected_amount?: any;
	    // Go type: decimal
	    actual_spent?: any;
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
	        this.projected_amount = this.convertValues(source["projected_amount"], null);
	        this.actual_spent = this.convertValues(source["actual_spent"], null);
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
	export class NetworkBackupEdges {
	    device?: NetworkDevice;
	    tenant?: Tenant;
	
	    static createFrom(source: any = {}) {
	        return new NetworkBackupEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.device = this.convertValues(source["device"], NetworkDevice);
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
	export class NetworkBackup {
	    id?: number;
	    content_hash?: string;
	    vault_path?: string;
	    // Go type: time
	    created_at?: any;
	    edges: NetworkBackupEdges;
	
	    static createFrom(source: any = {}) {
	        return new NetworkBackup(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.content_hash = source["content_hash"];
	        this.vault_path = source["vault_path"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.edges = this.convertValues(source["edges"], NetworkBackupEdges);
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
	export class NetworkLinkEdges {
	    source_port?: NetworkPort;
	    target_port?: NetworkPort;
	    tenant?: Tenant;
	
	    static createFrom(source: any = {}) {
	        return new NetworkLinkEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.source_port = this.convertValues(source["source_port"], NetworkPort);
	        this.target_port = this.convertValues(source["target_port"], NetworkPort);
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
	export class NetworkLink {
	    id?: number;
	    protocol?: string;
	    // Go type: time
	    last_seen?: any;
	    edges: NetworkLinkEdges;
	
	    static createFrom(source: any = {}) {
	        return new NetworkLink(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.protocol = source["protocol"];
	        this.last_seen = this.convertValues(source["last_seen"], null);
	        this.edges = this.convertValues(source["edges"], NetworkLinkEdges);
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
	export class NetworkPortEdges {
	    device?: NetworkDevice;
	    connected_to?: NetworkLink[];
	    tenant?: Tenant;
	
	    static createFrom(source: any = {}) {
	        return new NetworkPortEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.device = this.convertValues(source["device"], NetworkDevice);
	        this.connected_to = this.convertValues(source["connected_to"], NetworkLink);
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
	export class NetworkPort {
	    id?: number;
	    name?: string;
	    type?: string;
	    status?: string;
	    vlan?: number;
	    mac_address?: string;
	    poe_enabled?: boolean;
	    poe_wattage?: number;
	    description?: string;
	    edges: NetworkPortEdges;
	
	    static createFrom(source: any = {}) {
	        return new NetworkPort(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.type = source["type"];
	        this.status = source["status"];
	        this.vlan = source["vlan"];
	        this.mac_address = source["mac_address"];
	        this.poe_enabled = source["poe_enabled"];
	        this.poe_wattage = source["poe_wattage"];
	        this.description = source["description"];
	        this.edges = this.convertValues(source["edges"], NetworkPortEdges);
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
	export class NetworkDeviceEdges {
	    ports?: NetworkPort[];
	    backups?: NetworkBackup[];
	    tenant?: Tenant;
	
	    static createFrom(source: any = {}) {
	        return new NetworkDeviceEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ports = this.convertValues(source["ports"], NetworkPort);
	        this.backups = this.convertValues(source["backups"], NetworkBackup);
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
	export class NetworkDevice {
	    id?: number;
	    name?: string;
	    ip_address?: string;
	    vendor?: string;
	    model?: string;
	    software_version?: string;
	    status?: string;
	    // Go type: time
	    last_polled?: any;
	    // Go type: time
	    created_at?: any;
	    // Go type: time
	    updated_at?: any;
	    edges: NetworkDeviceEdges;
	
	    static createFrom(source: any = {}) {
	        return new NetworkDevice(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.ip_address = source["ip_address"];
	        this.vendor = source["vendor"];
	        this.model = source["model"];
	        this.software_version = source["software_version"];
	        this.status = source["status"];
	        this.last_polled = this.convertValues(source["last_polled"], null);
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	        this.edges = this.convertValues(source["edges"], NetworkDeviceEdges);
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
	export class ServiceRateEdges {
	    tenant?: Tenant;
	
	    static createFrom(source: any = {}) {
	        return new ServiceRateEdges(source);
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
	export class ServiceRate {
	    id?: number;
	    work_type?: string;
	    // Go type: decimal
	    rate?: any;
	    description?: string;
	    edges: ServiceRateEdges;
	
	    static createFrom(source: any = {}) {
	        return new ServiceRate(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.work_type = source["work_type"];
	        this.rate = this.convertValues(source["rate"], null);
	        this.description = source["description"];
	        this.edges = this.convertValues(source["edges"], ServiceRateEdges);
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
	    // Go type: decimal
	    estimated_cost?: any;
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
	        this.estimated_cost = this.convertValues(source["estimated_cost"], null);
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
	    hostname?: string;
	    ip?: string;
	    mac?: string;
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
	        this.hostname = source["hostname"];
	        this.ip = source["ip"];
	        this.mac = source["mac"];
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
	export class ScriptEdges {
	    tenant?: Tenant;
	    jobs?: Job[];
	
	    static createFrom(source: any = {}) {
	        return new ScriptEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.jobs = this.convertValues(source["jobs"], Job);
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
	export class Script {
	    id?: number;
	    name?: string;
	    description?: string;
	    content?: string;
	    type?: string;
	    parameters?: string[];
	    // Go type: time
	    created_at?: any;
	    // Go type: time
	    updated_at?: any;
	    edges: ScriptEdges;
	
	    static createFrom(source: any = {}) {
	        return new Script(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.content = source["content"];
	        this.type = source["type"];
	        this.parameters = source["parameters"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	        this.edges = this.convertValues(source["edges"], ScriptEdges);
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
	export class JobEdges {
	    tenant?: Tenant;
	    script?: Script;
	    executions?: JobExecution[];
	
	    static createFrom(source: any = {}) {
	        return new JobEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.script = this.convertValues(source["script"], Script);
	        this.executions = this.convertValues(source["executions"], JobExecution);
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
	export class Job {
	    id?: number;
	    name?: string;
	    cron_schedule?: string;
	    // Go type: time
	    next_run?: any;
	    // Go type: time
	    last_run?: any;
	    targets?: string[];
	    // Go type: time
	    created_at?: any;
	    // Go type: time
	    updated_at?: any;
	    edges: JobEdges;
	
	    static createFrom(source: any = {}) {
	        return new Job(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.cron_schedule = source["cron_schedule"];
	        this.next_run = this.convertValues(source["next_run"], null);
	        this.last_run = this.convertValues(source["last_run"], null);
	        this.targets = source["targets"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	        this.edges = this.convertValues(source["edges"], JobEdges);
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
	export class JobExecutionEdges {
	    job?: Job;
	    agent?: Agent;
	
	    static createFrom(source: any = {}) {
	        return new JobExecutionEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.job = this.convertValues(source["job"], Job);
	        this.agent = this.convertValues(source["agent"], Agent);
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
	export class JobExecution {
	    id?: number;
	    status?: string;
	    output?: string;
	    // Go type: time
	    started_at?: any;
	    // Go type: time
	    completed_at?: any;
	    // Go type: time
	    created_at?: any;
	    edges: JobExecutionEdges;
	
	    static createFrom(source: any = {}) {
	        return new JobExecution(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.status = source["status"];
	        this.output = source["output"];
	        this.started_at = this.convertValues(source["started_at"], null);
	        this.completed_at = this.convertValues(source["completed_at"], null);
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.edges = this.convertValues(source["edges"], JobExecutionEdges);
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
	    job_executions?: JobExecution[];
	
	    static createFrom(source: any = {}) {
	        return new AgentEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.job_executions = this.convertValues(source["job_executions"], JobExecution);
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
	export class DetectionEventEdges {
	    camera?: Camera;
	    tenant?: Tenant;
	
	    static createFrom(source: any = {}) {
	        return new DetectionEventEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.camera = this.convertValues(source["camera"], Camera);
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
	export class RecordingEdges {
	    camera?: Camera;
	    tenant?: Tenant;
	
	    static createFrom(source: any = {}) {
	        return new RecordingEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.camera = this.convertValues(source["camera"], Camera);
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
	export class JournalEntryEdges {
	    account?: Account;
	    tenant?: Tenant;
	    transaction?: Transaction;
	    approved_by?: User;
	
	    static createFrom(source: any = {}) {
	        return new JournalEntryEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.account = this.convertValues(source["account"], Account);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.transaction = this.convertValues(source["transaction"], Transaction);
	        this.approved_by = this.convertValues(source["approved_by"], User);
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
	export class JournalEntry {
	    id?: number;
	    // Go type: decimal
	    amount?: any;
	    direction?: string;
	    // Go type: time
	    created_at?: any;
	    description?: string;
	    approval_status?: string;
	    approved_by_id?: number;
	    edges: JournalEntryEdges;
	
	    static createFrom(source: any = {}) {
	        return new JournalEntry(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.amount = this.convertValues(source["amount"], null);
	        this.direction = source["direction"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.description = source["description"];
	        this.approval_status = source["approval_status"];
	        this.approved_by_id = source["approved_by_id"];
	        this.edges = this.convertValues(source["edges"], JournalEntryEdges);
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
	    // Go type: decimal
	    amount?: any;
	    direction?: string;
	    // Go type: time
	    created_at?: any;
	    edges: LedgerEntryEdges;
	
	    static createFrom(source: any = {}) {
	        return new LedgerEntry(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.amount = this.convertValues(source["amount"], null);
	        this.direction = source["direction"];
	        this.created_at = this.convertValues(source["created_at"], null);
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
	    ledger_entries?: LedgerEntry[];
	    journal_entries?: JournalEntry[];
	    recording?: Recording;
	    approved_by?: User;
	
	    static createFrom(source: any = {}) {
	        return new TransactionEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.ledger_entries = this.convertValues(source["ledger_entries"], LedgerEntry);
	        this.journal_entries = this.convertValues(source["journal_entries"], JournalEntry);
	        this.recording = this.convertValues(source["recording"], Recording);
	        this.approved_by = this.convertValues(source["approved_by"], User);
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
	    // Go type: time
	    date?: any;
	    // Go type: decimal
	    total_amount?: any;
	    // Go type: decimal
	    tax_amount?: any;
	    type?: string;
	    reference?: string;
	    uuid?: string;
	    recording_id?: number;
	    approval_status?: string;
	    is_intercompany?: boolean;
	    edges: TransactionEdges;
	
	    static createFrom(source: any = {}) {
	        return new Transaction(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.description = source["description"];
	        this.date = this.convertValues(source["date"], null);
	        this.total_amount = this.convertValues(source["total_amount"], null);
	        this.tax_amount = this.convertValues(source["tax_amount"], null);
	        this.type = source["type"];
	        this.reference = source["reference"];
	        this.uuid = source["uuid"];
	        this.recording_id = source["recording_id"];
	        this.approval_status = source["approval_status"];
	        this.is_intercompany = source["is_intercompany"];
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
	    tenant?: Tenant;
	
	    static createFrom(source: any = {}) {
	        return new SaaSUsageEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.identity = this.convertValues(source["identity"], SaaSIdentity);
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
	    name?: string;
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
	        this.name = source["name"];
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
	    // Go type: decimal
	    monthly_price?: any;
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
	        this.monthly_price = this.convertValues(source["monthly_price"], null);
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
	    tenant?: Tenant;
	
	    static createFrom(source: any = {}) {
	        return new SaaSIdentityEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.user = this.convertValues(source["user"], User);
	        this.app = this.convertValues(source["app"], SaaSApp);
	        this.usages = this.convertValues(source["usages"], SaaSUsage);
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
	    duration?: number;
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
	        this.duration = source["duration"];
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
	    status?: string;
	    work_type?: string;
	    invoice_id?: number;
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
	        this.status = source["status"];
	        this.work_type = source["work_type"];
	        this.invoice_id = source["invoice_id"];
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
	export class InventoryReservationEdges {
	    product?: Product;
	    tenant?: Tenant;
	
	    static createFrom(source: any = {}) {
	        return new InventoryReservationEdges(source);
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
	export class InventoryReservation {
	    id?: number;
	    // Go type: decimal
	    quantity?: any;
	    // Go type: time
	    expires_at?: any;
	    status?: string;
	    // Go type: time
	    created_at?: any;
	    edges: InventoryReservationEdges;
	
	    static createFrom(source: any = {}) {
	        return new InventoryReservation(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.quantity = this.convertValues(source["quantity"], null);
	        this.expires_at = this.convertValues(source["expires_at"], null);
	        this.status = source["status"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.edges = this.convertValues(source["edges"], InventoryReservationEdges);
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
	    // Go type: decimal
	    quantity?: any;
	    movement_type?: string;
	    reason?: string;
	    // Go type: decimal
	    unit_cost?: any;
	    // Go type: decimal
	    remaining_quantity?: any;
	    // Go type: decimal
	    calculated_cogs?: any;
	    metadata?: Record<string, any>;
	    // Go type: time
	    created_at?: any;
	    edges: StockMovementEdges;
	
	    static createFrom(source: any = {}) {
	        return new StockMovement(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.quantity = this.convertValues(source["quantity"], null);
	        this.movement_type = source["movement_type"];
	        this.reason = source["reason"];
	        this.unit_cost = this.convertValues(source["unit_cost"], null);
	        this.remaining_quantity = this.convertValues(source["remaining_quantity"], null);
	        this.calculated_cogs = this.convertValues(source["calculated_cogs"], null);
	        this.metadata = source["metadata"];
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
	    reservations?: InventoryReservation[];
	    vendor?: Account;
	
	    static createFrom(source: any = {}) {
	        return new ProductEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.movements = this.convertValues(source["movements"], StockMovement);
	        this.reservations = this.convertValues(source["reservations"], InventoryReservation);
	        this.vendor = this.convertValues(source["vendor"], Account);
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
	    // Go type: decimal
	    unit_cost?: any;
	    // Go type: decimal
	    quantity?: any;
	    attributes?: Record<string, any>;
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
	        this.unit_cost = this.convertValues(source["unit_cost"], null);
	        this.quantity = this.convertValues(source["quantity"], null);
	        this.attributes = source["attributes"];
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
	    metadata?: Record<string, any>;
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
	        this.metadata = source["metadata"];
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
	    tenant?: Tenant;
	
	    static createFrom(source: any = {}) {
	        return new AssetTypeEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.assets = this.convertValues(source["assets"], Asset);
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
	    product?: Product;
	
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
	        this.product = this.convertValues(source["product"], Product);
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
	    serial_number?: string;
	    manufacturer?: string;
	    vendor_support_phone?: string;
	    status?: string;
	    metadata?: Record<string, any>;
	    // Go type: time
	    last_certified_at?: any;
	    // Go type: time
	    purchase_date?: any;
	    // Go type: time
	    warranty_expiry?: any;
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
	        this.serial_number = source["serial_number"];
	        this.manufacturer = source["manufacturer"];
	        this.vendor_support_phone = source["vendor_support_phone"];
	        this.status = source["status"];
	        this.metadata = source["metadata"];
	        this.last_certified_at = this.convertValues(source["last_certified_at"], null);
	        this.purchase_date = this.convertValues(source["purchase_date"], null);
	        this.warranty_expiry = this.convertValues(source["warranty_expiry"], null);
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
	    tenant?: Tenant;
	
	    static createFrom(source: any = {}) {
	        return new PermissionEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.users = this.convertValues(source["users"], User);
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
	    parent?: Tenant;
	    children?: Tenant[];
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
	    service_rates?: ServiceRate[];
	    network_devices?: NetworkDevice[];
	    network_backups?: NetworkBackup[];
	    budget_forecasts?: BudgetForecast[];
	    employees?: Employee[];
	    compensation_agreements?: CompensationAgreement[];
	    vault_items?: VaultItem[];
	    journal_entries?: JournalEntry[];
	    recurring_invoices?: RecurringInvoice[];
	    inventory_reservations?: InventoryReservation[];
	    departments?: Department[];
	    permissions?: Permission[];
	    asset_types?: AssetType[];
	    detection_events?: DetectionEvent[];
	    saas_identities?: SaaSIdentity[];
	    saas_usages?: SaaSUsage[];
	    recordings?: Recording[];
	    network_links?: NetworkLink[];
	    network_ports?: NetworkPort[];
	    nexus_audits?: NexusAudit[];
	    succession_maps?: SuccessionMap[];
	    customer_account?: Account;
	    scripts?: Script[];
	    jobs?: Job[];
	    time_off_requests?: TimeOffRequest[];
	    time_off_policies?: TimeOffPolicy[];
	    time_off_balances?: TimeOffBalance[];
	    review_cycles?: ReviewCycle[];
	    performance_reviews?: PerformanceReview[];
	    goals?: Goal[];
	
	    static createFrom(source: any = {}) {
	        return new TenantEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.parent = this.convertValues(source["parent"], Tenant);
	        this.children = this.convertValues(source["children"], Tenant);
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
	        this.service_rates = this.convertValues(source["service_rates"], ServiceRate);
	        this.network_devices = this.convertValues(source["network_devices"], NetworkDevice);
	        this.network_backups = this.convertValues(source["network_backups"], NetworkBackup);
	        this.budget_forecasts = this.convertValues(source["budget_forecasts"], BudgetForecast);
	        this.employees = this.convertValues(source["employees"], Employee);
	        this.compensation_agreements = this.convertValues(source["compensation_agreements"], CompensationAgreement);
	        this.vault_items = this.convertValues(source["vault_items"], VaultItem);
	        this.journal_entries = this.convertValues(source["journal_entries"], JournalEntry);
	        this.recurring_invoices = this.convertValues(source["recurring_invoices"], RecurringInvoice);
	        this.inventory_reservations = this.convertValues(source["inventory_reservations"], InventoryReservation);
	        this.departments = this.convertValues(source["departments"], Department);
	        this.permissions = this.convertValues(source["permissions"], Permission);
	        this.asset_types = this.convertValues(source["asset_types"], AssetType);
	        this.detection_events = this.convertValues(source["detection_events"], DetectionEvent);
	        this.saas_identities = this.convertValues(source["saas_identities"], SaaSIdentity);
	        this.saas_usages = this.convertValues(source["saas_usages"], SaaSUsage);
	        this.recordings = this.convertValues(source["recordings"], Recording);
	        this.network_links = this.convertValues(source["network_links"], NetworkLink);
	        this.network_ports = this.convertValues(source["network_ports"], NetworkPort);
	        this.nexus_audits = this.convertValues(source["nexus_audits"], NexusAudit);
	        this.succession_maps = this.convertValues(source["succession_maps"], SuccessionMap);
	        this.customer_account = this.convertValues(source["customer_account"], Account);
	        this.scripts = this.convertValues(source["scripts"], Script);
	        this.jobs = this.convertValues(source["jobs"], Job);
	        this.time_off_requests = this.convertValues(source["time_off_requests"], TimeOffRequest);
	        this.time_off_policies = this.convertValues(source["time_off_policies"], TimeOffPolicy);
	        this.time_off_balances = this.convertValues(source["time_off_balances"], TimeOffBalance);
	        this.review_cycles = this.convertValues(source["review_cycles"], ReviewCycle);
	        this.performance_reviews = this.convertValues(source["performance_reviews"], PerformanceReview);
	        this.goals = this.convertValues(source["goals"], Goal);
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
	    // Go type: decimal
	    transaction_limit?: any;
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
	        this.transaction_limit = this.convertValues(source["transaction_limit"], null);
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
	    journal_entries?: JournalEntry[];
	    recurring_invoices?: RecurringInvoice[];
	
	    static createFrom(source: any = {}) {
	        return new AccountEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.entries = this.convertValues(source["entries"], LedgerEntry);
	        this.journal_entries = this.convertValues(source["journal_entries"], JournalEntry);
	        this.recurring_invoices = this.convertValues(source["recurring_invoices"], RecurringInvoice);
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
	    // Go type: decimal
	    balance?: any;
	    is_intercompany?: boolean;
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
	        this.balance = this.convertValues(source["balance"], null);
	        this.is_intercompany = source["is_intercompany"];
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

export namespace horizon {
	
	export class ProjectDTO {
	    id: number;
	    name: string;
	    description: string;
	    priority: string;
	    status: string;
	    cost: number;
	    date: string;
	
	    static createFrom(source: any = {}) {
	        return new ProjectDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.priority = source["priority"];
	        this.status = source["status"];
	        this.cost = source["cost"];
	        this.date = source["date"];
	    }
	}

}

export namespace http {
	
	export class Response {
	    Status: string;
	    StatusCode: number;
	    Proto: string;
	    ProtoMajor: number;
	    ProtoMinor: number;
	    Header: Record<string, Array<string>>;
	    Body: any;
	    ContentLength: number;
	    TransferEncoding: string[];
	    Close: boolean;
	    Uncompressed: boolean;
	    Trailer: Record<string, Array<string>>;
	    Request?: Request;
	    TLS?: tls.ConnectionState;
	
	    static createFrom(source: any = {}) {
	        return new Response(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Status = source["Status"];
	        this.StatusCode = source["StatusCode"];
	        this.Proto = source["Proto"];
	        this.ProtoMajor = source["ProtoMajor"];
	        this.ProtoMinor = source["ProtoMinor"];
	        this.Header = source["Header"];
	        this.Body = source["Body"];
	        this.ContentLength = source["ContentLength"];
	        this.TransferEncoding = source["TransferEncoding"];
	        this.Close = source["Close"];
	        this.Uncompressed = source["Uncompressed"];
	        this.Trailer = source["Trailer"];
	        this.Request = this.convertValues(source["Request"], Request);
	        this.TLS = this.convertValues(source["TLS"], tls.ConnectionState);
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
	export class Request {
	    Method: string;
	    URL?: url.URL;
	    Proto: string;
	    ProtoMajor: number;
	    ProtoMinor: number;
	    Header: Record<string, Array<string>>;
	    Body: any;
	    ContentLength: number;
	    TransferEncoding: string[];
	    Close: boolean;
	    Host: string;
	    Form: Record<string, Array<string>>;
	    PostForm: Record<string, Array<string>>;
	    MultipartForm?: multipart.Form;
	    Trailer: Record<string, Array<string>>;
	    RemoteAddr: string;
	    RequestURI: string;
	    TLS?: tls.ConnectionState;
	    Response?: Response;
	    Pattern: string;
	
	    static createFrom(source: any = {}) {
	        return new Request(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Method = source["Method"];
	        this.URL = this.convertValues(source["URL"], url.URL);
	        this.Proto = source["Proto"];
	        this.ProtoMajor = source["ProtoMajor"];
	        this.ProtoMinor = source["ProtoMinor"];
	        this.Header = source["Header"];
	        this.Body = source["Body"];
	        this.ContentLength = source["ContentLength"];
	        this.TransferEncoding = source["TransferEncoding"];
	        this.Close = source["Close"];
	        this.Host = source["Host"];
	        this.Form = source["Form"];
	        this.PostForm = source["PostForm"];
	        this.MultipartForm = this.convertValues(source["MultipartForm"], multipart.Form);
	        this.Trailer = source["Trailer"];
	        this.RemoteAddr = source["RemoteAddr"];
	        this.RequestURI = source["RequestURI"];
	        this.TLS = this.convertValues(source["TLS"], tls.ConnectionState);
	        this.Response = this.convertValues(source["Response"], Response);
	        this.Pattern = source["Pattern"];
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

export namespace multipart {
	
	export class FileHeader {
	    Filename: string;
	    Header: Record<string, Array<string>>;
	    Size: number;
	
	    static createFrom(source: any = {}) {
	        return new FileHeader(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Filename = source["Filename"];
	        this.Header = source["Header"];
	        this.Size = source["Size"];
	    }
	}
	export class Form {
	    Value: Record<string, Array<string>>;
	    File: Record<string, Array<FileHeader>>;
	
	    static createFrom(source: any = {}) {
	        return new Form(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Value = source["Value"];
	        this.File = this.convertValues(source["File"], Array<FileHeader>, true);
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

export namespace net {
	
	export class IPNet {
	    IP: number[];
	    Mask: number[];
	
	    static createFrom(source: any = {}) {
	        return new IPNet(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.IP = source["IP"];
	        this.Mask = source["Mask"];
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

export namespace peripherals {
	
	export class DeviceInfo {
	    id: string;
	    name: string;
	    type: string;
	    port: string;
	
	    static createFrom(source: any = {}) {
	        return new DeviceInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.type = source["type"];
	        this.port = source["port"];
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

export namespace pkix {
	
	export class AttributeTypeAndValue {
	    Type: number[];
	    Value: any;
	
	    static createFrom(source: any = {}) {
	        return new AttributeTypeAndValue(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Type = source["Type"];
	        this.Value = source["Value"];
	    }
	}
	export class Extension {
	    Id: number[];
	    Critical: boolean;
	    Value: number[];
	
	    static createFrom(source: any = {}) {
	        return new Extension(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Id = source["Id"];
	        this.Critical = source["Critical"];
	        this.Value = source["Value"];
	    }
	}
	export class Name {
	    Country: string[];
	    Organization: string[];
	    OrganizationalUnit: string[];
	    Locality: string[];
	    Province: string[];
	    StreetAddress: string[];
	    PostalCode: string[];
	    SerialNumber: string;
	    CommonName: string;
	    Names: AttributeTypeAndValue[];
	    ExtraNames: AttributeTypeAndValue[];
	
	    static createFrom(source: any = {}) {
	        return new Name(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Country = source["Country"];
	        this.Organization = source["Organization"];
	        this.OrganizationalUnit = source["OrganizationalUnit"];
	        this.Locality = source["Locality"];
	        this.Province = source["Province"];
	        this.StreetAddress = source["StreetAddress"];
	        this.PostalCode = source["PostalCode"];
	        this.SerialNumber = source["SerialNumber"];
	        this.CommonName = source["CommonName"];
	        this.Names = this.convertValues(source["Names"], AttributeTypeAndValue);
	        this.ExtraNames = this.convertValues(source["ExtraNames"], AttributeTypeAndValue);
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
	
	export class ProductDTO {
	    id: number;
	    sku: string;
	    name: string;
	    description: string;
	    unitCost: number;
	    quantity: number;
	    reserved: number;
	    incoming: number;
	
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
	export class TaxSummaryDTO {
	    box1: number;
	    box4: number;
	    box5: number;
	
	    static createFrom(source: any = {}) {
	        return new TaxSummaryDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.box1 = source["box1"];
	        this.box4 = source["box4"];
	        this.box5 = source["box5"];
	    }
	}

}

export namespace tls {
	
	export class ConnectionState {
	    Version: number;
	    HandshakeComplete: boolean;
	    DidResume: boolean;
	    CipherSuite: number;
	    NegotiatedProtocol: string;
	    NegotiatedProtocolIsMutual: boolean;
	    ServerName: string;
	    PeerCertificates: x509.Certificate[];
	    VerifiedChains: x509.Certificate[][];
	    SignedCertificateTimestamps: number[][];
	    OCSPResponse: number[];
	    TLSUnique: number[];
	    ECHAccepted: boolean;
	
	    static createFrom(source: any = {}) {
	        return new ConnectionState(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Version = source["Version"];
	        this.HandshakeComplete = source["HandshakeComplete"];
	        this.DidResume = source["DidResume"];
	        this.CipherSuite = source["CipherSuite"];
	        this.NegotiatedProtocol = source["NegotiatedProtocol"];
	        this.NegotiatedProtocolIsMutual = source["NegotiatedProtocolIsMutual"];
	        this.ServerName = source["ServerName"];
	        this.PeerCertificates = this.convertValues(source["PeerCertificates"], x509.Certificate);
	        this.VerifiedChains = this.convertValues(source["VerifiedChains"], x509.Certificate);
	        this.SignedCertificateTimestamps = source["SignedCertificateTimestamps"];
	        this.OCSPResponse = source["OCSPResponse"];
	        this.TLSUnique = source["TLSUnique"];
	        this.ECHAccepted = source["ECHAccepted"];
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

export namespace url {
	
	export class Userinfo {
	
	
	    static createFrom(source: any = {}) {
	        return new Userinfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	
	    }
	}
	export class URL {
	    Scheme: string;
	    Opaque: string;
	    // Go type: Userinfo
	    User?: any;
	    Host: string;
	    Path: string;
	    RawPath: string;
	    OmitHost: boolean;
	    ForceQuery: boolean;
	    RawQuery: string;
	    Fragment: string;
	    RawFragment: string;
	
	    static createFrom(source: any = {}) {
	        return new URL(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Scheme = source["Scheme"];
	        this.Opaque = source["Opaque"];
	        this.User = this.convertValues(source["User"], null);
	        this.Host = source["Host"];
	        this.Path = source["Path"];
	        this.RawPath = source["RawPath"];
	        this.OmitHost = source["OmitHost"];
	        this.ForceQuery = source["ForceQuery"];
	        this.RawQuery = source["RawQuery"];
	        this.Fragment = source["Fragment"];
	        this.RawFragment = source["RawFragment"];
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

export namespace x509 {
	
	export class PolicyMapping {
	    // Go type: OID
	    IssuerDomainPolicy: any;
	    // Go type: OID
	    SubjectDomainPolicy: any;
	
	    static createFrom(source: any = {}) {
	        return new PolicyMapping(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.IssuerDomainPolicy = this.convertValues(source["IssuerDomainPolicy"], null);
	        this.SubjectDomainPolicy = this.convertValues(source["SubjectDomainPolicy"], null);
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
	export class OID {
	
	
	    static createFrom(source: any = {}) {
	        return new OID(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	
	    }
	}
	export class Certificate {
	    Raw: number[];
	    RawTBSCertificate: number[];
	    RawSubjectPublicKeyInfo: number[];
	    RawSubject: number[];
	    RawIssuer: number[];
	    Signature: number[];
	    SignatureAlgorithm: number;
	    PublicKeyAlgorithm: number;
	    PublicKey: any;
	    Version: number;
	    // Go type: big
	    SerialNumber?: any;
	    Issuer: pkix.Name;
	    Subject: pkix.Name;
	    // Go type: time
	    NotBefore: any;
	    // Go type: time
	    NotAfter: any;
	    KeyUsage: number;
	    Extensions: pkix.Extension[];
	    ExtraExtensions: pkix.Extension[];
	    UnhandledCriticalExtensions: number[][];
	    ExtKeyUsage: number[];
	    UnknownExtKeyUsage: number[][];
	    BasicConstraintsValid: boolean;
	    IsCA: boolean;
	    MaxPathLen: number;
	    MaxPathLenZero: boolean;
	    SubjectKeyId: number[];
	    AuthorityKeyId: number[];
	    OCSPServer: string[];
	    IssuingCertificateURL: string[];
	    DNSNames: string[];
	    EmailAddresses: string[];
	    IPAddresses: number[][];
	    URIs: url.URL[];
	    PermittedDNSDomainsCritical: boolean;
	    PermittedDNSDomains: string[];
	    ExcludedDNSDomains: string[];
	    PermittedIPRanges: net.IPNet[];
	    ExcludedIPRanges: net.IPNet[];
	    PermittedEmailAddresses: string[];
	    ExcludedEmailAddresses: string[];
	    PermittedURIDomains: string[];
	    ExcludedURIDomains: string[];
	    CRLDistributionPoints: string[];
	    PolicyIdentifiers: number[][];
	    Policies: OID[];
	    InhibitAnyPolicy: number;
	    InhibitAnyPolicyZero: boolean;
	    InhibitPolicyMapping: number;
	    InhibitPolicyMappingZero: boolean;
	    RequireExplicitPolicy: number;
	    RequireExplicitPolicyZero: boolean;
	    PolicyMappings: PolicyMapping[];
	
	    static createFrom(source: any = {}) {
	        return new Certificate(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Raw = source["Raw"];
	        this.RawTBSCertificate = source["RawTBSCertificate"];
	        this.RawSubjectPublicKeyInfo = source["RawSubjectPublicKeyInfo"];
	        this.RawSubject = source["RawSubject"];
	        this.RawIssuer = source["RawIssuer"];
	        this.Signature = source["Signature"];
	        this.SignatureAlgorithm = source["SignatureAlgorithm"];
	        this.PublicKeyAlgorithm = source["PublicKeyAlgorithm"];
	        this.PublicKey = source["PublicKey"];
	        this.Version = source["Version"];
	        this.SerialNumber = this.convertValues(source["SerialNumber"], null);
	        this.Issuer = this.convertValues(source["Issuer"], pkix.Name);
	        this.Subject = this.convertValues(source["Subject"], pkix.Name);
	        this.NotBefore = this.convertValues(source["NotBefore"], null);
	        this.NotAfter = this.convertValues(source["NotAfter"], null);
	        this.KeyUsage = source["KeyUsage"];
	        this.Extensions = this.convertValues(source["Extensions"], pkix.Extension);
	        this.ExtraExtensions = this.convertValues(source["ExtraExtensions"], pkix.Extension);
	        this.UnhandledCriticalExtensions = source["UnhandledCriticalExtensions"];
	        this.ExtKeyUsage = source["ExtKeyUsage"];
	        this.UnknownExtKeyUsage = source["UnknownExtKeyUsage"];
	        this.BasicConstraintsValid = source["BasicConstraintsValid"];
	        this.IsCA = source["IsCA"];
	        this.MaxPathLen = source["MaxPathLen"];
	        this.MaxPathLenZero = source["MaxPathLenZero"];
	        this.SubjectKeyId = source["SubjectKeyId"];
	        this.AuthorityKeyId = source["AuthorityKeyId"];
	        this.OCSPServer = source["OCSPServer"];
	        this.IssuingCertificateURL = source["IssuingCertificateURL"];
	        this.DNSNames = source["DNSNames"];
	        this.EmailAddresses = source["EmailAddresses"];
	        this.IPAddresses = source["IPAddresses"];
	        this.URIs = this.convertValues(source["URIs"], url.URL);
	        this.PermittedDNSDomainsCritical = source["PermittedDNSDomainsCritical"];
	        this.PermittedDNSDomains = source["PermittedDNSDomains"];
	        this.ExcludedDNSDomains = source["ExcludedDNSDomains"];
	        this.PermittedIPRanges = this.convertValues(source["PermittedIPRanges"], net.IPNet);
	        this.ExcludedIPRanges = this.convertValues(source["ExcludedIPRanges"], net.IPNet);
	        this.PermittedEmailAddresses = source["PermittedEmailAddresses"];
	        this.ExcludedEmailAddresses = source["ExcludedEmailAddresses"];
	        this.PermittedURIDomains = source["PermittedURIDomains"];
	        this.ExcludedURIDomains = source["ExcludedURIDomains"];
	        this.CRLDistributionPoints = source["CRLDistributionPoints"];
	        this.PolicyIdentifiers = source["PolicyIdentifiers"];
	        this.Policies = this.convertValues(source["Policies"], OID);
	        this.InhibitAnyPolicy = source["InhibitAnyPolicy"];
	        this.InhibitAnyPolicyZero = source["InhibitAnyPolicyZero"];
	        this.InhibitPolicyMapping = source["InhibitPolicyMapping"];
	        this.InhibitPolicyMappingZero = source["InhibitPolicyMappingZero"];
	        this.RequireExplicitPolicy = source["RequireExplicitPolicy"];
	        this.RequireExplicitPolicyZero = source["RequireExplicitPolicyZero"];
	        this.PolicyMappings = this.convertValues(source["PolicyMappings"], PolicyMapping);
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

