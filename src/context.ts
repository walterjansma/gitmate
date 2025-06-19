import { execSync } from "child_process";

export interface GitContext {
  currentBranch: string;
  isClean: boolean;
  untrackedFiles: string[];
  modifiedFiles: string[];
  stagedFiles: string[];
  lastCommit: string;
  remoteUrl?: string;
}

// Get current branch name
export function getCurrentBranch(): string {
  try {
    return execSync("git branch --show-current", { encoding: "utf8" }).trim();
  } catch (error) {
    throw new Error("Not a git repository or git command failed");
  }
}

// Check if working directory is clean
export function isWorkingDirectoryClean(): boolean {
  try {
    const status = execSync("git status --porcelain", { encoding: "utf8" });
    return status.trim() === "";
  } catch (error) {
    return false;
  }
}

// Get list of untracked files
export function getUntrackedFiles(): string[] {
  try {
    const output = execSync("git ls-files --others --exclude-standard", {
      encoding: "utf8",
    });
    return output.trim() ? output.trim().split("\n") : [];
  } catch (error) {
    return [];
  }
}

// Get list of modified files
export function getModifiedFiles(): string[] {
  try {
    const output = execSync("git diff --name-only", { encoding: "utf8" });
    return output.trim() ? output.trim().split("\n") : [];
  } catch (error) {
    return [];
  }
}

// Get list of staged files
export function getStagedFiles(): string[] {
  try {
    const output = execSync("git diff --cached --name-only", {
      encoding: "utf8",
    });
    return output.trim() ? output.trim().split("\n") : [];
  } catch (error) {
    return [];
  }
}

// Get last commit hash
export function getLastCommit(): string {
  try {
    return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  } catch (error) {
    return "";
  }
}

// Get remote URL
export function getRemoteUrl(): string | undefined {
  try {
    return execSync("git config --get remote.origin.url", {
      encoding: "utf8",
    }).trim();
  } catch (error) {
    return undefined;
  }
}

// Get comprehensive git context
export function getGitContext(): GitContext {
  try {
    const currentBranch = getCurrentBranch();
    const isClean = isWorkingDirectoryClean();
    const untrackedFiles = getUntrackedFiles();
    const modifiedFiles = getModifiedFiles();
    const stagedFiles = getStagedFiles();
    const lastCommit = getLastCommit();
    const remoteUrl = getRemoteUrl();

    return {
      currentBranch,
      isClean,
      untrackedFiles,
      modifiedFiles,
      stagedFiles,
      lastCommit,
      remoteUrl,
    };
  } catch (error) {
    throw new Error("Failed to get git context: " + (error as Error).message);
  }
}

// Format git context as a string for LLM
export function formatGitContextForLLM(context: GitContext): string {
  let contextStr = `Current git context:
- Branch: ${context.currentBranch}
- Working directory clean: ${context.isClean ? "Yes" : "No"}`;

  if (!context.isClean) {
    if (context.modifiedFiles.length > 0) {
      contextStr += `\n- Modified files: ${context.modifiedFiles.join(", ")}`;
    }
    if (context.stagedFiles.length > 0) {
      contextStr += `\n- Staged files: ${context.stagedFiles.join(", ")}`;
    }
    if (context.untrackedFiles.length > 0) {
      contextStr += `\n- Untracked files: ${context.untrackedFiles.join(", ")}`;
    }
  }

  if (context.lastCommit) {
    contextStr += `\n- Last commit: ${context.lastCommit.substring(0, 8)}`;
  }

  if (context.remoteUrl) {
    contextStr += `\n- Remote: ${context.remoteUrl}`;
  }

  return contextStr;
}
