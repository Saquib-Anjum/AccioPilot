import test from "node:test";
import assert from "node:assert/strict";
import type { Task } from "@acciopilot/contracts";
import {
  approveTask,
  InvalidTransitionError,
  rejectTask,
  transitionTask,
  VersionConflictError,
} from "./index.js";
const task: Task = {
  id: "t1",
  ownerId: "u1",
  title: "Demo",
  instructions: "Do work",
  acceptanceCriteria: [],
  baseBranch: "main",
  baseCommitSha: "abc",
  workBranch: "task/t1",
  agent: "mock",
  status: "queued",
  version: 0,
  attempt: 1,
};
test("allows the review lifecycle and increments versions", () => {
  let current = task;
  for (const status of [
    "preparing",
    "running",
    "collecting_changes",
    "checking",
    "awaiting_review",
  ] as const)
    current = transitionTask(current, status, current.version).task;
  const approved = approveTask(current, current.version, "u1").task;
  assert.equal(approved.status, "approved");
  assert.equal(approved.version, 6);
});
test("rejects invalid transitions and stale versions", () => {
  assert.throws(
    () => transitionTask(task, "approved", 0),
    InvalidTransitionError,
  );
  assert.throws(
    () => transitionTask(task, "preparing", 4),
    VersionConflictError,
  );
});
test("requires a comment when rejecting review", () => {
  let current = task;
  for (const status of ["preparing", "running", "collecting_changes", "checking", "awaiting_review"] as const)
    current = transitionTask(current, status, current.version).task;
  const rejected = rejectTask(current, current.version, "u1", "Needs changes").task;
  assert.equal(rejected.status, "rejected");
});
