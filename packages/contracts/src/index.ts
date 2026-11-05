export const taskStatuses = ["queued","preparing","running","collecting_changes","checking","awaiting_review","approved","rejected","failed","cancelled","timed_out"] as const;
export type TaskStatus = (typeof taskStatuses)[number];
export type AgentId = "switch" | "codex" | "mock";
export interface Task { id:string; ownerId:string; title:string; instructions:string; acceptanceCriteria:string[]; baseBranch:string; baseCommitSha:string; workBranch:string; agent:AgentId; status:TaskStatus; version:number; attempt:number; cancellationRequestedAt?:string; }
export type TaskEventType = "status_changed" | "progress" | "check_completed" | "approval_recorded" | "failure";
export interface TaskEvent { sequence:number; type:TaskEventType; timestamp:string; actor:string; message:string; data?:Record<string,unknown>; }
export interface AgentRunInput { taskId:string; instructions:string; acceptanceCriteria:string[]; workspacePath:string; branch:string; policyLimits:{maxOutputBytes:number; timeoutSeconds:number}; }
export interface AgentRunResult { outcome:"completed"|"cancelled"|"failed"; summary:string; }
export interface AgentEventSink { emit(event:{type:"progress"|"failure"; message:string}):Promise<void>; }
export interface CodingAgentAdapter { readonly id:AgentId; run(input:AgentRunInput,events:AgentEventSink,signal:AbortSignal):Promise<AgentRunResult>; }
