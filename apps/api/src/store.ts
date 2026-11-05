import type { Task, TaskEvent, TaskStatus } from "@acciopilot/contracts";
import { transitionTask, approveTask, rejectTask } from "@acciopilot/domain";

export interface Project { id: string; ownerId: string; name: string; repositoryId: string; fullName: string; defaultBranch: string; }
export class MemoryStore {
  private readonly tasks = new Map<string, Task>();
  private readonly projects = new Map<string, Project>();
  private readonly events = new Map<string, TaskEvent[]>();
  private id = 0;
  private nextId(prefix: string): string { this.id += 1; return `${prefix}_${this.id}`; }
  listProjects(ownerId: string): Project[] { return [...this.projects.values()].filter((project) => project.ownerId === ownerId); }
  createProject(ownerId: string, input: { repositoryId: string; name?: string }): Project {
    const project = { id: this.nextId("project"), ownerId, name: input.name ?? input.repositoryId, repositoryId: input.repositoryId, fullName: input.repositoryId, defaultBranch: "main" };
    this.projects.set(project.id, project); return project;
  }
  getProject(ownerId: string, id: string): Project | undefined { const project = this.projects.get(id); return project?.ownerId === ownerId ? project : undefined; }
  listTasks(ownerId: string, projectId?: string, status?: TaskStatus): Task[] { return [...this.tasks.values()].filter((task) => task.ownerId === ownerId && (!projectId || task.id.startsWith(projectId) || this.getProject(ownerId, projectId)) && (!status || task.status === status)); }
  createTask(ownerId: string, input: { projectId: string; title: string; instructions: string; acceptanceCriteria: string[]; baseBranch: string; agent: Task["agent"] }): Task {
    const id = this.nextId("task"); const task: Task = { id, ownerId, title: input.title, instructions: input.instructions, acceptanceCriteria: input.acceptanceCriteria, baseBranch: input.baseBranch, baseCommitSha: "unresolved", workBranch: `acciopilot/${id}`, agent: input.agent, status: "queued", version: 0, attempt: 1 };
    this.tasks.set(id, task); this.events.set(id, [{ sequence: 1, type: "progress", timestamp: new Date().toISOString(), actor: "system", message: "Task queued" }]); return task;
  }
  getTask(ownerId: string, id: string): Task | undefined { const task = this.tasks.get(id); return task?.ownerId === ownerId ? task : undefined; }
  getEvents(ownerId: string, id: string, after: number): TaskEvent[] { if (!this.getTask(ownerId, id)) return []; return (this.events.get(id) ?? []).filter((event) => event.sequence > after); }
  transition(ownerId: string, id: string, next: TaskStatus, expectedVersion: number, actor = "system"): Task {
    const current = this.requireTask(ownerId, id); const result = transitionTask(current, next, expectedVersion); this.save(result.task, { ...result.event, actor }); return result.task;
  }
  approve(ownerId: string, id: string, expectedVersion: number, actor: string, comment?: string): Task { const current = this.requireTask(ownerId, id); const result = approveTask(current, expectedVersion, actor, comment); this.save(result.task, result.event); return result.task; }
  reject(ownerId: string, id: string, expectedVersion: number, actor: string, comment: string): Task { const current = this.requireTask(ownerId, id); const result = rejectTask(current, expectedVersion, actor, comment); this.save(result.task, result.event); return result.task; }
  private requireTask(ownerId: string, id: string): Task { const task = this.getTask(ownerId, id); if (!task) throw new Error("TASK_NOT_FOUND"); return task; }
  private save(task: Task, event: TaskEvent): void { this.tasks.set(task.id, task); const list = this.events.get(task.id) ?? []; list.push({ ...event, sequence: list.length + 1 }); this.events.set(task.id, list); }
}
