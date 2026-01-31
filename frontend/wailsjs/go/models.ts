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
	
	export class EnvVar {
	    key: string;
	    value: string;
	
	    static createFrom(source: any = {}) {
	        return new EnvVar(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.key = source["key"];
	        this.value = source["value"];
	    }
	}
	export class FileInfo {
	    name: string;
	    size: number;
	    mode: string;
	    modTime: time.Time;
	    isDir: boolean;
	
	    static createFrom(source: any = {}) {
	        return new FileInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.size = source["size"];
	        this.mode = source["mode"];
	        this.modTime = this.convertValues(source["modTime"], time.Time);
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
	export class LogEntry {
	    time: string;
	    level: string;
	    source: string;
	    message: string;
	    event_id?: number;
	
	    static createFrom(source: any = {}) {
	        return new LogEntry(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.time = source["time"];
	        this.level = source["level"];
	        this.source = source["source"];
	        this.message = source["message"];
	        this.event_id = source["event_id"];
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
	export class ProcessInfo {
	    pid: number;
	    name: string;
	    username: string;
	    cpu: number;
	    memory: number;
	
	    static createFrom(source: any = {}) {
	        return new ProcessInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.pid = source["pid"];
	        this.name = source["name"];
	        this.username = source["username"];
	        this.cpu = source["cpu"];
	        this.memory = source["memory"];
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

export namespace common {
	
	export class SoftwareInfo {
	    name: string;
	    version: string;
	    install_date: string;
	    publisher: string;
	
	    static createFrom(source: any = {}) {
	        return new SoftwareInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.version = source["version"];
	        this.install_date = source["install_date"];
	        this.publisher = source["publisher"];
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
	
	export class StockAuditLogEdges {
	    tenant?: Tenant;
	
	    static createFrom(source: any = {}) {
	        return new StockAuditLogEdges(source);
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
	export class StockAuditLog {
	    id?: number;
	    action?: string;
	    entity_type?: string;
	    entity_id?: number;
	    user_id?: number;
	    user_name?: string;
	    details?: Record<string, any>;
	    created_at?: time.Time;
	    edges: StockAuditLogEdges;
	
	    static createFrom(source: any = {}) {
	        return new StockAuditLog(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.action = source["action"];
	        this.entity_type = source["entity_type"];
	        this.entity_id = source["entity_id"];
	        this.user_id = source["user_id"];
	        this.user_name = source["user_name"];
	        this.details = source["details"];
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.edges = this.convertValues(source["edges"], StockAuditLogEdges);
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
	export class RetentionPolicyEdges {
	    tenant?: Tenant;
	
	    static createFrom(source: any = {}) {
	        return new RetentionPolicyEdges(source);
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
	export class RetentionPolicy {
	    id?: number;
	    name?: string;
	    description?: string;
	    retention_days?: number;
	    action?: string;
	    file_type_filter?: string;
	    active?: boolean;
	    created_at?: time.Time;
	    edges: RetentionPolicyEdges;
	
	    static createFrom(source: any = {}) {
	        return new RetentionPolicy(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.retention_days = source["retention_days"];
	        this.action = source["action"];
	        this.file_type_filter = source["file_type_filter"];
	        this.active = source["active"];
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.edges = this.convertValues(source["edges"], RetentionPolicyEdges);
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
	export class ContactEdges {
	    tenant?: Tenant;
	
	    static createFrom(source: any = {}) {
	        return new ContactEdges(source);
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
	export class Contact {
	    id?: number;
	    name?: string;
	    email?: string;
	    phone?: string;
	    address?: string;
	    type?: string;
	    loyalty_points?: number;
	    // Go type: decimal
	    lifetime_value?: any;
	    created_at?: time.Time;
	    updated_at?: time.Time;
	    edges: ContactEdges;
	
	    static createFrom(source: any = {}) {
	        return new Contact(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.email = source["email"];
	        this.phone = source["phone"];
	        this.address = source["address"];
	        this.type = source["type"];
	        this.loyalty_points = source["loyalty_points"];
	        this.lifetime_value = this.convertValues(source["lifetime_value"], null);
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.updated_at = this.convertValues(source["updated_at"], time.Time);
	        this.edges = this.convertValues(source["edges"], ContactEdges);
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
	    timestamp?: time.Time;
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
	        this.timestamp = this.convertValues(source["timestamp"], time.Time);
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
	    next_run_date?: time.Time;
	    last_run_date?: time.Time;
	    is_active?: boolean;
	    created_at?: time.Time;
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
	        this.next_run_date = this.convertValues(source["next_run_date"], time.Time);
	        this.last_run_date = this.convertValues(source["last_run_date"], time.Time);
	        this.is_active = source["is_active"];
	        this.created_at = this.convertValues(source["created_at"], time.Time);
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
	    created_at?: time.Time;
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
	        this.created_at = this.convertValues(source["created_at"], time.Time);
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
	    created_at?: time.Time;
	    edges: NetworkBackupEdges;
	
	    static createFrom(source: any = {}) {
	        return new NetworkBackup(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.content_hash = source["content_hash"];
	        this.vault_path = source["vault_path"];
	        this.created_at = this.convertValues(source["created_at"], time.Time);
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
	    last_seen?: time.Time;
	    edges: NetworkLinkEdges;
	
	    static createFrom(source: any = {}) {
	        return new NetworkLink(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.protocol = source["protocol"];
	        this.last_seen = this.convertValues(source["last_seen"], time.Time);
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
	    last_polled?: time.Time;
	    created_at?: time.Time;
	    updated_at?: time.Time;
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
	        this.last_polled = this.convertValues(source["last_polled"], time.Time);
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.updated_at = this.convertValues(source["updated_at"], time.Time);
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
	    target_date?: time.Time;
	    strategic_commentary?: string;
	    created_at?: time.Time;
	    updated_at?: time.Time;
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
	        this.target_date = this.convertValues(source["target_date"], time.Time);
	        this.strategic_commentary = source["strategic_commentary"];
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.updated_at = this.convertValues(source["updated_at"], time.Time);
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
	    timestamp?: time.Time;
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
	        this.timestamp = this.convertValues(source["timestamp"], time.Time);
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
	    created_at?: time.Time;
	    updated_at?: time.Time;
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
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.updated_at = this.convertValues(source["updated_at"], time.Time);
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
	    start_date?: time.Time;
	    end_date?: time.Time;
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
	        this.start_date = this.convertValues(source["start_date"], time.Time);
	        this.end_date = this.convertValues(source["end_date"], time.Time);
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
	    discovered_at?: time.Time;
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
	        this.discovered_at = this.convertValues(source["discovered_at"], time.Time);
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
	    created_at?: time.Time;
	    updated_at?: time.Time;
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
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.updated_at = this.convertValues(source["updated_at"], time.Time);
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
	    next_run?: time.Time;
	    last_run?: time.Time;
	    targets?: string[];
	    created_at?: time.Time;
	    updated_at?: time.Time;
	    edges: JobEdges;
	
	    static createFrom(source: any = {}) {
	        return new Job(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.cron_schedule = source["cron_schedule"];
	        this.next_run = this.convertValues(source["next_run"], time.Time);
	        this.last_run = this.convertValues(source["last_run"], time.Time);
	        this.targets = source["targets"];
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.updated_at = this.convertValues(source["updated_at"], time.Time);
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
	    started_at?: time.Time;
	    completed_at?: time.Time;
	    created_at?: time.Time;
	    edges: JobExecutionEdges;
	
	    static createFrom(source: any = {}) {
	        return new JobExecution(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.status = source["status"];
	        this.output = source["output"];
	        this.started_at = this.convertValues(source["started_at"], time.Time);
	        this.completed_at = this.convertValues(source["completed_at"], time.Time);
	        this.created_at = this.convertValues(source["created_at"], time.Time);
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
	    last_seen?: time.Time;
	    created_at?: time.Time;
	    updated_at?: time.Time;
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
	        this.last_seen = this.convertValues(source["last_seen"], time.Time);
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.updated_at = this.convertValues(source["updated_at"], time.Time);
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
	    timestamp?: time.Time;
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
	        this.timestamp = this.convertValues(source["timestamp"], time.Time);
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
	    timestamp?: time.Time;
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
	        this.timestamp = this.convertValues(source["timestamp"], time.Time);
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
	    created_at?: time.Time;
	    updated_at?: time.Time;
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
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.updated_at = this.convertValues(source["updated_at"], time.Time);
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
	    start_time?: time.Time;
	    end_time?: time.Time;
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
	        this.start_time = this.convertValues(source["start_time"], time.Time);
	        this.end_time = this.convertValues(source["end_time"], time.Time);
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
	    created_at?: time.Time;
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
	        this.created_at = this.convertValues(source["created_at"], time.Time);
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
	    created_at?: time.Time;
	    edges: LedgerEntryEdges;
	
	    static createFrom(source: any = {}) {
	        return new LedgerEntry(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.amount = this.convertValues(source["amount"], null);
	        this.direction = source["direction"];
	        this.created_at = this.convertValues(source["created_at"], time.Time);
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
	    date?: time.Time;
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
	        this.date = this.convertValues(source["date"], time.Time);
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
	export class VaultTemplateEdges {
	    tenant?: Tenant;
	    created_by?: User;
	
	    static createFrom(source: any = {}) {
	        return new VaultTemplateEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.created_by = this.convertValues(source["created_by"], User);
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
	export class VaultTemplate {
	    id?: number;
	    name?: string;
	    description?: string;
	    content_hash?: string;
	    file_extension?: string;
	    created_at?: time.Time;
	    edges: VaultTemplateEdges;
	
	    static createFrom(source: any = {}) {
	        return new VaultTemplate(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.content_hash = source["content_hash"];
	        this.file_extension = source["file_extension"];
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.edges = this.convertValues(source["edges"], VaultTemplateEdges);
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
	export class LegalHoldEdges {
	    tenant?: Tenant;
	    created_by?: User;
	    items?: VaultItem[];
	
	    static createFrom(source: any = {}) {
	        return new LegalHoldEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.created_by = this.convertValues(source["created_by"], User);
	        this.items = this.convertValues(source["items"], VaultItem);
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
	export class LegalHold {
	    id?: number;
	    name?: string;
	    description?: string;
	    start_date?: time.Time;
	    end_date?: time.Time;
	    active?: boolean;
	    created_at?: time.Time;
	    edges: LegalHoldEdges;
	
	    static createFrom(source: any = {}) {
	        return new LegalHold(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.start_date = this.convertValues(source["start_date"], time.Time);
	        this.end_date = this.convertValues(source["end_date"], time.Time);
	        this.active = source["active"];
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.edges = this.convertValues(source["edges"], LegalHoldEdges);
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
	export class VaultCommentEdges {
	    item?: VaultItem;
	    author?: User;
	
	    static createFrom(source: any = {}) {
	        return new VaultCommentEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.item = this.convertValues(source["item"], VaultItem);
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
	export class VaultComment {
	    id?: number;
	    content?: string;
	    page?: number;
	    x?: number;
	    y?: number;
	    created_at?: time.Time;
	    updated_at?: time.Time;
	    edges: VaultCommentEdges;
	
	    static createFrom(source: any = {}) {
	        return new VaultComment(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.content = source["content"];
	        this.page = source["page"];
	        this.x = source["x"];
	        this.y = source["y"];
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.updated_at = this.convertValues(source["updated_at"], time.Time);
	        this.edges = this.convertValues(source["edges"], VaultCommentEdges);
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
	export class VaultVersionEdges {
	    item?: VaultItem;
	    created_by?: User;
	
	    static createFrom(source: any = {}) {
	        return new VaultVersionEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.item = this.convertValues(source["item"], VaultItem);
	        this.created_by = this.convertValues(source["created_by"], User);
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
	export class VaultVersion {
	    id?: number;
	    version_number?: number;
	    hash?: string;
	    size?: number;
	    comment?: string;
	    created_at?: time.Time;
	    edges: VaultVersionEdges;
	
	    static createFrom(source: any = {}) {
	        return new VaultVersion(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.version_number = source["version_number"];
	        this.hash = source["hash"];
	        this.size = source["size"];
	        this.comment = source["comment"];
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.edges = this.convertValues(source["edges"], VaultVersionEdges);
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
	export class VaultShareLinkEdges {
	    item?: VaultItem;
	    tenant?: Tenant;
	
	    static createFrom(source: any = {}) {
	        return new VaultShareLinkEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.item = this.convertValues(source["item"], VaultItem);
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
	export class VaultShareLink {
	    id?: number;
	    token?: string;
	    name?: string;
	    password_hash?: string;
	    expires_at?: time.Time;
	    max_views?: number;
	    view_count?: number;
	    created_at?: time.Time;
	    edges: VaultShareLinkEdges;
	
	    static createFrom(source: any = {}) {
	        return new VaultShareLink(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.token = source["token"];
	        this.name = source["name"];
	        this.password_hash = source["password_hash"];
	        this.expires_at = this.convertValues(source["expires_at"], time.Time);
	        this.max_views = source["max_views"];
	        this.view_count = source["view_count"];
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.edges = this.convertValues(source["edges"], VaultShareLinkEdges);
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
	    share_links?: VaultShareLink[];
	    versions?: VaultVersion[];
	    comments?: VaultComment[];
	    favorited_by?: VaultFavorite[];
	    legal_holds?: LegalHold[];
	
	    static createFrom(source: any = {}) {
	        return new VaultItemEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.share_links = this.convertValues(source["share_links"], VaultShareLink);
	        this.versions = this.convertValues(source["versions"], VaultVersion);
	        this.comments = this.convertValues(source["comments"], VaultComment);
	        this.favorited_by = this.convertValues(source["favorited_by"], VaultFavorite);
	        this.legal_holds = this.convertValues(source["legal_holds"], LegalHold);
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
	    created_at?: time.Time;
	    updated_at?: time.Time;
	    deleted_at?: time.Time;
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
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.updated_at = this.convertValues(source["updated_at"], time.Time);
	        this.deleted_at = this.convertValues(source["deleted_at"], time.Time);
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
	export class VaultFavoriteEdges {
	    user?: User;
	    item?: VaultItem;
	
	    static createFrom(source: any = {}) {
	        return new VaultFavoriteEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.user = this.convertValues(source["user"], User);
	        this.item = this.convertValues(source["item"], VaultItem);
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
	export class VaultFavorite {
	    id?: number;
	    created_at?: time.Time;
	    edges: VaultFavoriteEdges;
	
	    static createFrom(source: any = {}) {
	        return new VaultFavorite(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.edges = this.convertValues(source["edges"], VaultFavoriteEdges);
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
	    timestamp?: time.Time;
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
	        this.timestamp = this.convertValues(source["timestamp"], time.Time);
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
	    created_at?: time.Time;
	    updated_at?: time.Time;
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
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.updated_at = this.convertValues(source["updated_at"], time.Time);
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
	    created_at?: time.Time;
	    updated_at?: time.Time;
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
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.updated_at = this.convertValues(source["updated_at"], time.Time);
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
	    last_login?: time.Time;
	    created_at?: time.Time;
	    updated_at?: time.Time;
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
	        this.last_login = this.convertValues(source["last_login"], time.Time);
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.updated_at = this.convertValues(source["updated_at"], time.Time);
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
	    created_at?: time.Time;
	    duration?: number;
	    read_at?: time.Time;
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
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.duration = source["duration"];
	        this.read_at = this.convertValues(source["read_at"], time.Time);
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
	    start_time?: time.Time;
	    end_time?: time.Time;
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
	        this.start_time = this.convertValues(source["start_time"], time.Time);
	        this.end_time = this.convertValues(source["end_time"], time.Time);
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
	    source_id?: string;
	    source_app?: string;
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
	        this.source_id = source["source_id"];
	        this.source_app = source["source_app"];
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
	export class WorkLogEdges {
	    ticket?: Ticket;
	    technician?: User;
	
	    static createFrom(source: any = {}) {
	        return new WorkLogEdges(source);
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
	export class WorkLog {
	    id?: number;
	    duration_hours?: number;
	    note?: string;
	    started_at?: time.Time;
	    is_billable?: boolean;
	    status?: string;
	    work_type?: string;
	    invoice_id?: number;
	    edges: WorkLogEdges;
	
	    static createFrom(source: any = {}) {
	        return new WorkLog(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.duration_hours = source["duration_hours"];
	        this.note = source["note"];
	        this.started_at = this.convertValues(source["started_at"], time.Time);
	        this.is_billable = source["is_billable"];
	        this.status = source["status"];
	        this.work_type = source["work_type"];
	        this.invoice_id = source["invoice_id"];
	        this.edges = this.convertValues(source["edges"], WorkLogEdges);
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
	export class InventoryCountEdges {
	    tenant?: Tenant;
	    product?: Product;
	
	    static createFrom(source: any = {}) {
	        return new InventoryCountEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
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
	export class InventoryCount {
	    id?: number;
	    // Go type: decimal
	    counted_qty?: any;
	    // Go type: decimal
	    system_qty?: any;
	    // Go type: decimal
	    variance?: any;
	    counted_at?: time.Time;
	    counted_by?: string;
	    notes?: string;
	    edges: InventoryCountEdges;
	
	    static createFrom(source: any = {}) {
	        return new InventoryCount(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.counted_qty = this.convertValues(source["counted_qty"], null);
	        this.system_qty = this.convertValues(source["system_qty"], null);
	        this.variance = this.convertValues(source["variance"], null);
	        this.counted_at = this.convertValues(source["counted_at"], time.Time);
	        this.counted_by = source["counted_by"];
	        this.notes = source["notes"];
	        this.edges = this.convertValues(source["edges"], InventoryCountEdges);
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
	export class StockAlertEdges {
	    tenant?: Tenant;
	    product?: Product;
	
	    static createFrom(source: any = {}) {
	        return new StockAlertEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
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
	export class StockAlert {
	    id?: number;
	    alert_type?: string;
	    message?: string;
	    is_read?: boolean;
	    created_at?: time.Time;
	    edges: StockAlertEdges;
	
	    static createFrom(source: any = {}) {
	        return new StockAlert(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.alert_type = source["alert_type"];
	        this.message = source["message"];
	        this.is_read = source["is_read"];
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.edges = this.convertValues(source["edges"], StockAlertEdges);
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
	export class MaintenanceScheduleEdges {
	    tenant?: Tenant;
	    product?: Product;
	
	    static createFrom(source: any = {}) {
	        return new MaintenanceScheduleEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
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
	export class MaintenanceSchedule {
	    id?: number;
	    scheduled_at?: time.Time;
	    completed_at?: time.Time;
	    notes?: string;
	    status?: string;
	    created_at?: time.Time;
	    edges: MaintenanceScheduleEdges;
	
	    static createFrom(source: any = {}) {
	        return new MaintenanceSchedule(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.scheduled_at = this.convertValues(source["scheduled_at"], time.Time);
	        this.completed_at = this.convertValues(source["completed_at"], time.Time);
	        this.notes = source["notes"];
	        this.status = source["status"];
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.edges = this.convertValues(source["edges"], MaintenanceScheduleEdges);
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
	export class ProductVariantEdges {
	    product?: Product;
	
	    static createFrom(source: any = {}) {
	        return new ProductVariantEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
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
	export class ProductVariant {
	    id?: number;
	    name?: string;
	    sku?: string;
	    price_adjustment?: number;
	    stock?: number;
	    edges: ProductVariantEdges;
	
	    static createFrom(source: any = {}) {
	        return new ProductVariant(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.sku = source["sku"];
	        this.price_adjustment = source["price_adjustment"];
	        this.stock = source["stock"];
	        this.edges = this.convertValues(source["edges"], ProductVariantEdges);
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
	export class BenefitPlanEdges {
	    tenant?: Tenant;
	    enrollments?: BenefitEnrollment[];
	
	    static createFrom(source: any = {}) {
	        return new BenefitPlanEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.enrollments = this.convertValues(source["enrollments"], BenefitEnrollment);
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
	export class BenefitPlan {
	    id?: number;
	    name?: string;
	    description?: string;
	    type?: string;
	    status?: string;
	    employer_contribution?: number;
	    employee_deduction?: number;
	    created_at?: time.Time;
	    updated_at?: time.Time;
	    edges: BenefitPlanEdges;
	
	    static createFrom(source: any = {}) {
	        return new BenefitPlan(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.type = source["type"];
	        this.status = source["status"];
	        this.employer_contribution = source["employer_contribution"];
	        this.employee_deduction = source["employee_deduction"];
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.updated_at = this.convertValues(source["updated_at"], time.Time);
	        this.edges = this.convertValues(source["edges"], BenefitPlanEdges);
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
	export class BenefitEnrollmentEdges {
	    tenant?: Tenant;
	    plan?: BenefitPlan;
	    employee?: Employee;
	
	    static createFrom(source: any = {}) {
	        return new BenefitEnrollmentEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.plan = this.convertValues(source["plan"], BenefitPlan);
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
	export class BenefitEnrollment {
	    id?: number;
	    tier?: string;
	    employee_cost?: number;
	    employer_cost?: number;
	    status?: string;
	    effective_from?: time.Time;
	    effective_to?: time.Time;
	    created_at?: time.Time;
	    updated_at?: time.Time;
	    edges: BenefitEnrollmentEdges;
	
	    static createFrom(source: any = {}) {
	        return new BenefitEnrollment(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.tier = source["tier"];
	        this.employee_cost = source["employee_cost"];
	        this.employer_cost = source["employer_cost"];
	        this.status = source["status"];
	        this.effective_from = this.convertValues(source["effective_from"], time.Time);
	        this.effective_to = this.convertValues(source["effective_to"], time.Time);
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.updated_at = this.convertValues(source["updated_at"], time.Time);
	        this.edges = this.convertValues(source["edges"], BenefitEnrollmentEdges);
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
	export class CandidateEdges {
	    tenant?: Tenant;
	    applications?: Application[];
	
	    static createFrom(source: any = {}) {
	        return new CandidateEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.applications = this.convertValues(source["applications"], Application);
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
	export class Candidate {
	    id?: number;
	    first_name?: string;
	    last_name?: string;
	    email?: string;
	    phone?: string;
	    resume_url?: string;
	    linkedin_url?: string;
	    created_at?: time.Time;
	    updated_at?: time.Time;
	    edges: CandidateEdges;
	
	    static createFrom(source: any = {}) {
	        return new Candidate(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.first_name = source["first_name"];
	        this.last_name = source["last_name"];
	        this.email = source["email"];
	        this.phone = source["phone"];
	        this.resume_url = source["resume_url"];
	        this.linkedin_url = source["linkedin_url"];
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.updated_at = this.convertValues(source["updated_at"], time.Time);
	        this.edges = this.convertValues(source["edges"], CandidateEdges);
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
	export class JobPostingEdges {
	    tenant?: Tenant;
	    applications?: Application[];
	
	    static createFrom(source: any = {}) {
	        return new JobPostingEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.applications = this.convertValues(source["applications"], Application);
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
	export class JobPosting {
	    id?: number;
	    title?: string;
	    description?: string;
	    requirements?: string;
	    location?: string;
	    salary_range?: string;
	    status?: string;
	    created_at?: time.Time;
	    updated_at?: time.Time;
	    edges: JobPostingEdges;
	
	    static createFrom(source: any = {}) {
	        return new JobPosting(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.title = source["title"];
	        this.description = source["description"];
	        this.requirements = source["requirements"];
	        this.location = source["location"];
	        this.salary_range = source["salary_range"];
	        this.status = source["status"];
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.updated_at = this.convertValues(source["updated_at"], time.Time);
	        this.edges = this.convertValues(source["edges"], JobPostingEdges);
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
	export class ApplicationEdges {
	    tenant?: Tenant;
	    job_posting?: JobPosting;
	    candidate?: Candidate;
	    interviews?: Interview[];
	
	    static createFrom(source: any = {}) {
	        return new ApplicationEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.job_posting = this.convertValues(source["job_posting"], JobPosting);
	        this.candidate = this.convertValues(source["candidate"], Candidate);
	        this.interviews = this.convertValues(source["interviews"], Interview);
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
	export class Application {
	    id?: number;
	    status?: string;
	    applied_at?: time.Time;
	    updated_at?: time.Time;
	    edges: ApplicationEdges;
	
	    static createFrom(source: any = {}) {
	        return new Application(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.status = source["status"];
	        this.applied_at = this.convertValues(source["applied_at"], time.Time);
	        this.updated_at = this.convertValues(source["updated_at"], time.Time);
	        this.edges = this.convertValues(source["edges"], ApplicationEdges);
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
	export class InterviewEdges {
	    tenant?: Tenant;
	    application?: Application;
	    interviewers?: Employee[];
	
	    static createFrom(source: any = {}) {
	        return new InterviewEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.application = this.convertValues(source["application"], Application);
	        this.interviewers = this.convertValues(source["interviewers"], Employee);
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
	export class Interview {
	    id?: number;
	    scheduled_at?: time.Time;
	    type?: string;
	    status?: string;
	    feedback?: string;
	    created_at?: time.Time;
	    updated_at?: time.Time;
	    edges: InterviewEdges;
	
	    static createFrom(source: any = {}) {
	        return new Interview(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.scheduled_at = this.convertValues(source["scheduled_at"], time.Time);
	        this.type = source["type"];
	        this.status = source["status"];
	        this.feedback = source["feedback"];
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.updated_at = this.convertValues(source["updated_at"], time.Time);
	        this.edges = this.convertValues(source["edges"], InterviewEdges);
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
	    employee?: Employee;
	    ticket?: Ticket;
	
	    static createFrom(source: any = {}) {
	        return new TimeEntryEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.employee = this.convertValues(source["employee"], Employee);
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
	export class TimeEntry {
	    id?: number;
	    start_time?: time.Time;
	    end_time?: time.Time;
	    created_at?: time.Time;
	    ticket_id?: number;
	    technician_id?: number;
	    status?: string;
	    work_type?: string;
	    duration_hours?: number;
	    invoice_id?: number;
	    edges: TimeEntryEdges;
	
	    static createFrom(source: any = {}) {
	        return new TimeEntry(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.start_time = this.convertValues(source["start_time"], time.Time);
	        this.end_time = this.convertValues(source["end_time"], time.Time);
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.ticket_id = source["ticket_id"];
	        this.technician_id = source["technician_id"];
	        this.status = source["status"];
	        this.work_type = source["work_type"];
	        this.duration_hours = source["duration_hours"];
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
	    target_date?: time.Time;
	    key_results?: string;
	    manager_notes?: string;
	    completed_at?: time.Time;
	    created_at?: time.Time;
	    updated_at?: time.Time;
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
	        this.target_date = this.convertValues(source["target_date"], time.Time);
	        this.key_results = source["key_results"];
	        this.manager_notes = source["manager_notes"];
	        this.completed_at = this.convertValues(source["completed_at"], time.Time);
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.updated_at = this.convertValues(source["updated_at"], time.Time);
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
	    start_date?: time.Time;
	    end_date?: time.Time;
	    review_deadline?: time.Time;
	    created_at?: time.Time;
	    updated_at?: time.Time;
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
	        this.start_date = this.convertValues(source["start_date"], time.Time);
	        this.end_date = this.convertValues(source["end_date"], time.Time);
	        this.review_deadline = this.convertValues(source["review_deadline"], time.Time);
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.updated_at = this.convertValues(source["updated_at"], time.Time);
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
	    review_type?: string;
	    strengths?: string;
	    areas_for_improvement?: string;
	    manager_comments?: string;
	    goals_assessment?: Record<string, any>;
	    survey_responses?: Record<string, any>;
	    status?: string;
	    submitted_at?: time.Time;
	    acknowledged_at?: time.Time;
	    created_at?: time.Time;
	    updated_at?: time.Time;
	    edges: PerformanceReviewEdges;
	
	    static createFrom(source: any = {}) {
	        return new PerformanceReview(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.overall_rating = source["overall_rating"];
	        this.review_type = source["review_type"];
	        this.strengths = source["strengths"];
	        this.areas_for_improvement = source["areas_for_improvement"];
	        this.manager_comments = source["manager_comments"];
	        this.goals_assessment = source["goals_assessment"];
	        this.survey_responses = source["survey_responses"];
	        this.status = source["status"];
	        this.submitted_at = this.convertValues(source["submitted_at"], time.Time);
	        this.acknowledged_at = this.convertValues(source["acknowledged_at"], time.Time);
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.updated_at = this.convertValues(source["updated_at"], time.Time);
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
	    created_at?: time.Time;
	    updated_at?: time.Time;
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
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.updated_at = this.convertValues(source["updated_at"], time.Time);
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
	    created_at?: time.Time;
	    updated_at?: time.Time;
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
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.updated_at = this.convertValues(source["updated_at"], time.Time);
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
	    start_date?: time.Time;
	    end_date?: time.Time;
	    requested_hours?: number;
	    status?: string;
	    notes?: string;
	    rejection_reason?: string;
	    reviewed_at?: time.Time;
	    created_at?: time.Time;
	    updated_at?: time.Time;
	    edges: TimeOffRequestEdges;
	
	    static createFrom(source: any = {}) {
	        return new TimeOffRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.request_type = source["request_type"];
	        this.start_date = this.convertValues(source["start_date"], time.Time);
	        this.end_date = this.convertValues(source["end_date"], time.Time);
	        this.requested_hours = source["requested_hours"];
	        this.status = source["status"];
	        this.notes = source["notes"];
	        this.rejection_reason = source["rejection_reason"];
	        this.reviewed_at = this.convertValues(source["reviewed_at"], time.Time);
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.updated_at = this.convertValues(source["updated_at"], time.Time);
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
	    created_at?: time.Time;
	    edges: SuccessionMapEdges;
	
	    static createFrom(source: any = {}) {
	        return new SuccessionMap(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.readiness_level = source["readiness_level"];
	        this.notes = source["notes"];
	        this.created_at = this.convertValues(source["created_at"], time.Time);
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
	    effective_date?: time.Time;
	    status?: string;
	    created_at?: time.Time;
	    edges: CompensationAgreementEdges;
	
	    static createFrom(source: any = {}) {
	        return new CompensationAgreement(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.base_salary = this.convertValues(source["base_salary"], null);
	        this.currency = source["currency"];
	        this.effective_date = this.convertValues(source["effective_date"], time.Time);
	        this.status = source["status"];
	        this.created_at = this.convertValues(source["created_at"], time.Time);
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
	    asset_assignments?: AssetAssignment[];
	    time_entries?: TimeEntry[];
	    conducted_interviews?: Interview[];
	    benefit_enrollments?: BenefitEnrollment[];
	
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
	        this.asset_assignments = this.convertValues(source["asset_assignments"], AssetAssignment);
	        this.time_entries = this.convertValues(source["time_entries"], TimeEntry);
	        this.conducted_interviews = this.convertValues(source["conducted_interviews"], Interview);
	        this.benefit_enrollments = this.convertValues(source["benefit_enrollments"], BenefitEnrollment);
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
	    signed_at?: time.Time;
	    hipo_status?: boolean;
	    created_at?: time.Time;
	    updated_at?: time.Time;
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
	        this.signed_at = this.convertValues(source["signed_at"], time.Time);
	        this.hipo_status = source["hipo_status"];
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.updated_at = this.convertValues(source["updated_at"], time.Time);
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
	export class AssetAssignmentEdges {
	    tenant?: Tenant;
	    product?: Product;
	    employee?: Employee;
	
	    static createFrom(source: any = {}) {
	        return new AssetAssignmentEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.product = this.convertValues(source["product"], Product);
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
	export class AssetAssignment {
	    id?: number;
	    assigned_at?: time.Time;
	    returned_at?: time.Time;
	    status?: string;
	    quantity?: number;
	    edges: AssetAssignmentEdges;
	
	    static createFrom(source: any = {}) {
	        return new AssetAssignment(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.assigned_at = this.convertValues(source["assigned_at"], time.Time);
	        this.returned_at = this.convertValues(source["returned_at"], time.Time);
	        this.status = source["status"];
	        this.quantity = source["quantity"];
	        this.edges = this.convertValues(source["edges"], AssetAssignmentEdges);
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
	export class WarehouseEdges {
	    tenant?: Tenant;
	    products?: Product[];
	
	    static createFrom(source: any = {}) {
	        return new WarehouseEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.products = this.convertValues(source["products"], Product);
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
	export class Warehouse {
	    id?: number;
	    name?: string;
	    location_code?: string;
	    address?: string;
	    is_active?: boolean;
	    edges: WarehouseEdges;
	
	    static createFrom(source: any = {}) {
	        return new Warehouse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.location_code = source["location_code"];
	        this.address = source["address"];
	        this.is_active = source["is_active"];
	        this.edges = this.convertValues(source["edges"], WarehouseEdges);
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
	export class CategoryEdges {
	    tenant?: Tenant;
	    products?: Product[];
	
	    static createFrom(source: any = {}) {
	        return new CategoryEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.products = this.convertValues(source["products"], Product);
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
	export class Category {
	    id?: number;
	    name?: string;
	    description?: string;
	    type?: string;
	    edges: CategoryEdges;
	
	    static createFrom(source: any = {}) {
	        return new Category(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.type = source["type"];
	        this.edges = this.convertValues(source["edges"], CategoryEdges);
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
	export class PurchaseOrderLineEdges {
	    purchase_order?: PurchaseOrder;
	    product?: Product;
	
	    static createFrom(source: any = {}) {
	        return new PurchaseOrderLineEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.purchase_order = this.convertValues(source["purchase_order"], PurchaseOrder);
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
	export class PurchaseOrderLine {
	    id?: number;
	    quantity?: number;
	    // Go type: decimal
	    unit_cost?: any;
	    received_qty?: number;
	    edges: PurchaseOrderLineEdges;
	
	    static createFrom(source: any = {}) {
	        return new PurchaseOrderLine(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.quantity = source["quantity"];
	        this.unit_cost = this.convertValues(source["unit_cost"], null);
	        this.received_qty = source["received_qty"];
	        this.edges = this.convertValues(source["edges"], PurchaseOrderLineEdges);
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
	export class PurchaseOrderEdges {
	    tenant?: Tenant;
	    supplier?: Supplier;
	    lines?: PurchaseOrderLine[];
	
	    static createFrom(source: any = {}) {
	        return new PurchaseOrderEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.supplier = this.convertValues(source["supplier"], Supplier);
	        this.lines = this.convertValues(source["lines"], PurchaseOrderLine);
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
	export class PurchaseOrder {
	    id?: number;
	    po_number?: string;
	    status?: string;
	    order_date?: time.Time;
	    expected_date?: time.Time;
	    // Go type: decimal
	    total_amount?: any;
	    notes?: string;
	    created_at?: time.Time;
	    updated_at?: time.Time;
	    edges: PurchaseOrderEdges;
	
	    static createFrom(source: any = {}) {
	        return new PurchaseOrder(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.po_number = source["po_number"];
	        this.status = source["status"];
	        this.order_date = this.convertValues(source["order_date"], time.Time);
	        this.expected_date = this.convertValues(source["expected_date"], time.Time);
	        this.total_amount = this.convertValues(source["total_amount"], null);
	        this.notes = source["notes"];
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.updated_at = this.convertValues(source["updated_at"], time.Time);
	        this.edges = this.convertValues(source["edges"], PurchaseOrderEdges);
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
	export class SupplierEdges {
	    tenant?: Tenant;
	    products?: Product[];
	    purchase_orders?: PurchaseOrder[];
	
	    static createFrom(source: any = {}) {
	        return new SupplierEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.products = this.convertValues(source["products"], Product);
	        this.purchase_orders = this.convertValues(source["purchase_orders"], PurchaseOrder);
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
	export class Supplier {
	    id?: number;
	    name?: string;
	    contact_person?: string;
	    email?: string;
	    phone?: string;
	    address?: string;
	    website?: string;
	    edges: SupplierEdges;
	
	    static createFrom(source: any = {}) {
	        return new Supplier(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.contact_person = source["contact_person"];
	        this.email = source["email"];
	        this.phone = source["phone"];
	        this.address = source["address"];
	        this.website = source["website"];
	        this.edges = this.convertValues(source["edges"], SupplierEdges);
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
	    expires_at?: time.Time;
	    status?: string;
	    created_at?: time.Time;
	    edges: InventoryReservationEdges;
	
	    static createFrom(source: any = {}) {
	        return new InventoryReservation(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.quantity = this.convertValues(source["quantity"], null);
	        this.expires_at = this.convertValues(source["expires_at"], time.Time);
	        this.status = source["status"];
	        this.created_at = this.convertValues(source["created_at"], time.Time);
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
	    created_at?: time.Time;
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
	        this.created_at = this.convertValues(source["created_at"], time.Time);
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
	    supplier?: Supplier;
	    category?: Category;
	    warehouse?: Warehouse;
	    assignments?: AssetAssignment[];
	    variants?: ProductVariant[];
	    maintenance_schedules?: MaintenanceSchedule[];
	    alerts?: StockAlert[];
	    purchase_order_lines?: PurchaseOrderLine[];
	    inventory_counts?: InventoryCount[];
	
	    static createFrom(source: any = {}) {
	        return new ProductEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.movements = this.convertValues(source["movements"], StockMovement);
	        this.reservations = this.convertValues(source["reservations"], InventoryReservation);
	        this.vendor = this.convertValues(source["vendor"], Account);
	        this.supplier = this.convertValues(source["supplier"], Supplier);
	        this.category = this.convertValues(source["category"], Category);
	        this.warehouse = this.convertValues(source["warehouse"], Warehouse);
	        this.assignments = this.convertValues(source["assignments"], AssetAssignment);
	        this.variants = this.convertValues(source["variants"], ProductVariant);
	        this.maintenance_schedules = this.convertValues(source["maintenance_schedules"], MaintenanceSchedule);
	        this.alerts = this.convertValues(source["alerts"], StockAlert);
	        this.purchase_order_lines = this.convertValues(source["purchase_order_lines"], PurchaseOrderLine);
	        this.inventory_counts = this.convertValues(source["inventory_counts"], InventoryCount);
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
	    created_at?: time.Time;
	    updated_at?: time.Time;
	    min_stock_level?: number;
	    max_stock_level?: number;
	    barcode?: string;
	    location?: string;
	    is_variant_parent?: boolean;
	    serial_number?: string;
	    purchase_date?: time.Time;
	    // Go type: decimal
	    purchase_price?: any;
	    useful_life_months?: number;
	    warranty_expires_at?: time.Time;
	    disposal_date?: time.Time;
	    disposal_reason?: string;
	    is_disposed?: boolean;
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
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.updated_at = this.convertValues(source["updated_at"], time.Time);
	        this.min_stock_level = source["min_stock_level"];
	        this.max_stock_level = source["max_stock_level"];
	        this.barcode = source["barcode"];
	        this.location = source["location"];
	        this.is_variant_parent = source["is_variant_parent"];
	        this.serial_number = source["serial_number"];
	        this.purchase_date = this.convertValues(source["purchase_date"], time.Time);
	        this.purchase_price = this.convertValues(source["purchase_price"], null);
	        this.useful_life_months = source["useful_life_months"];
	        this.warranty_expires_at = this.convertValues(source["warranty_expires_at"], time.Time);
	        this.disposal_date = this.convertValues(source["disposal_date"], time.Time);
	        this.disposal_reason = source["disposal_reason"];
	        this.is_disposed = source["is_disposed"];
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
	    created_at?: time.Time;
	    updated_at?: time.Time;
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
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.updated_at = this.convertValues(source["updated_at"], time.Time);
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
	    expires_at?: time.Time;
	    consumed?: boolean;
	    created_at?: time.Time;
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
	        this.expires_at = this.convertValues(source["expires_at"], time.Time);
	        this.consumed = source["consumed"];
	        this.created_at = this.convertValues(source["created_at"], time.Time);
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
	    last_revealed_at?: time.Time;
	    metadata?: Record<string, any>;
	    created_at?: time.Time;
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
	        this.last_revealed_at = this.convertValues(source["last_revealed_at"], time.Time);
	        this.metadata = source["metadata"];
	        this.created_at = this.convertValues(source["created_at"], time.Time);
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
	    last_certified_at?: time.Time;
	    purchase_date?: time.Time;
	    warranty_expiry?: time.Time;
	    created_at?: time.Time;
	    updated_at?: time.Time;
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
	        this.last_certified_at = this.convertValues(source["last_certified_at"], time.Time);
	        this.purchase_date = this.convertValues(source["purchase_date"], time.Time);
	        this.warranty_expiry = this.convertValues(source["warranty_expiry"], time.Time);
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.updated_at = this.convertValues(source["updated_at"], time.Time);
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
	    work_logs?: WorkLog[];
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
	        this.work_logs = this.convertValues(source["work_logs"], WorkLog);
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
	    created_at?: time.Time;
	    updated_at?: time.Time;
	    resolved_at?: time.Time;
	    due_date?: time.Time;
	    claim_lease_owner?: string;
	    claim_lease_expires_at?: time.Time;
	    deep_link?: string;
	    execution_plan?: Record<string, any>;
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
	        this.created_at = this.convertValues(source["created_at"], time.Time);
	        this.updated_at = this.convertValues(source["updated_at"], time.Time);
	        this.resolved_at = this.convertValues(source["resolved_at"], time.Time);
	        this.due_date = this.convertValues(source["due_date"], time.Time);
	        this.claim_lease_owner = source["claim_lease_owner"];
	        this.claim_lease_expires_at = this.convertValues(source["claim_lease_expires_at"], time.Time);
	        this.deep_link = source["deep_link"];
	        this.execution_plan = source["execution_plan"];
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
	    work_logs?: WorkLog[];
	    owned_assets?: Asset[];
	    authored_sops?: SOP[];
	    call_logs?: CallLog[];
	    voicemails?: Voicemail[];
	    saas_identities?: SaaSIdentity[];
	    favorites?: VaultFavorite[];
	    vault_comments?: VaultComment[];
	    created_versions?: VaultVersion[];
	    created_legal_holds?: LegalHold[];
	    created_templates?: VaultTemplate[];
	
	    static createFrom(source: any = {}) {
	        return new UserEdges(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tenant = this.convertValues(source["tenant"], Tenant);
	        this.permissions = this.convertValues(source["permissions"], Permission);
	        this.requested_tickets = this.convertValues(source["requested_tickets"], Ticket);
	        this.assigned_tickets = this.convertValues(source["assigned_tickets"], Ticket);
	        this.work_logs = this.convertValues(source["work_logs"], WorkLog);
	        this.owned_assets = this.convertValues(source["owned_assets"], Asset);
	        this.authored_sops = this.convertValues(source["authored_sops"], SOP);
	        this.call_logs = this.convertValues(source["call_logs"], CallLog);
	        this.voicemails = this.convertValues(source["voicemails"], Voicemail);
	        this.saas_identities = this.convertValues(source["saas_identities"], SaaSIdentity);
	        this.favorites = this.convertValues(source["favorites"], VaultFavorite);
	        this.vault_comments = this.convertValues(source["vault_comments"], VaultComment);
	        this.created_versions = this.convertValues(source["created_versions"], VaultVersion);
	        this.created_legal_holds = this.convertValues(source["created_legal_holds"], LegalHold);
	        this.created_templates = this.convertValues(source["created_templates"], VaultTemplate);
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
	    created_at?: time.Time;
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
	        this.created_at = this.convertValues(source["created_at"], time.Time);
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
	    vault_share_links?: VaultShareLink[];
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
	    suppliers?: Supplier[];
	    categories?: Category[];
	    warehouses?: Warehouse[];
	    asset_assignments?: AssetAssignment[];
	    contacts?: Contact[];
	    legal_holds?: LegalHold[];
	    retention_policies?: RetentionPolicy[];
	    vault_templates?: VaultTemplate[];
	    stock_audit_logs?: StockAuditLog[];
	    maintenance_schedules?: MaintenanceSchedule[];
	    stock_alerts?: StockAlert[];
	    purchase_orders?: PurchaseOrder[];
	    inventory_counts?: InventoryCount[];
	    job_postings?: JobPosting[];
	    candidates?: Candidate[];
	    applications?: Application[];
	    interviews?: Interview[];
	    benefit_plans?: BenefitPlan[];
	    benefit_enrollments?: BenefitEnrollment[];
	
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
	        this.vault_share_links = this.convertValues(source["vault_share_links"], VaultShareLink);
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
	        this.suppliers = this.convertValues(source["suppliers"], Supplier);
	        this.categories = this.convertValues(source["categories"], Category);
	        this.warehouses = this.convertValues(source["warehouses"], Warehouse);
	        this.asset_assignments = this.convertValues(source["asset_assignments"], AssetAssignment);
	        this.contacts = this.convertValues(source["contacts"], Contact);
	        this.legal_holds = this.convertValues(source["legal_holds"], LegalHold);
	        this.retention_policies = this.convertValues(source["retention_policies"], RetentionPolicy);
	        this.vault_templates = this.convertValues(source["vault_templates"], VaultTemplate);
	        this.stock_audit_logs = this.convertValues(source["stock_audit_logs"], StockAuditLog);
	        this.maintenance_schedules = this.convertValues(source["maintenance_schedules"], MaintenanceSchedule);
	        this.stock_alerts = this.convertValues(source["stock_alerts"], StockAlert);
	        this.purchase_orders = this.convertValues(source["purchase_orders"], PurchaseOrder);
	        this.inventory_counts = this.convertValues(source["inventory_counts"], InventoryCount);
	        this.job_postings = this.convertValues(source["job_postings"], JobPosting);
	        this.candidates = this.convertValues(source["candidates"], Candidate);
	        this.applications = this.convertValues(source["applications"], Application);
	        this.interviews = this.convertValues(source["interviews"], Interview);
	        this.benefit_plans = this.convertValues(source["benefit_plans"], BenefitPlan);
	        this.benefit_enrollments = this.convertValues(source["benefit_enrollments"], BenefitEnrollment);
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
	    created_at?: time.Time;
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
	        this.created_at = this.convertValues(source["created_at"], time.Time);
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
	    created_at?: time.Time;
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
	        this.created_at = this.convertValues(source["created_at"], time.Time);
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
	    modTime: time.Time;
	    isDir: boolean;
	
	    static createFrom(source: any = {}) {
	        return new FileDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.path = source["path"];
	        this.size = source["size"];
	        this.modTime = this.convertValues(source["modTime"], time.Time);
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
	    NotBefore: time.Time;
	    NotAfter: time.Time;
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
	        this.NotBefore = this.convertValues(source["NotBefore"], time.Time);
	        this.NotAfter = this.convertValues(source["NotAfter"], time.Time);
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

