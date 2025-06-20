import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as childProcess from "child_process";
import {
	getCurrentBranch,
	isWorkingDirectoryClean,
	getUntrackedFiles,
	getModifiedFiles,
	getStagedFiles,
	getLastCommit,
	getRemoteUrl,
	getGitContext,
	formatGitContextForLLM,
} from "../src/context.js"
import GitContext from "../src/types/GitContext.js"; // adjust path if needed

describe("git utilities", () => {
	// Mock execSync before each test
	beforeEach(() => {
		// this will mock 'child_process' entirely
		vi.mock("child_process", () => {
			return {
				execSync: vi.fn()
			};
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("getCurrentBranch returns trimmed branch name", () => {
		(childProcess.execSync as any).mockReturnValue("main\n");
		expect(getCurrentBranch()).toBe("main");
	});

	it("getCurrentBranch throws on error", () => {
		(childProcess.execSync as any).mockImplementation(() => {
		throw new Error("fail");
		});
		expect(() => getCurrentBranch()).toThrow("Not a git repository or git command failed");
	});

	it("isWorkingDirectoryClean returns true when status is empty", () => {
		(childProcess.execSync as any).mockReturnValue("");
		expect(isWorkingDirectoryClean()).toBe(true);
	});

	it("isWorkingDirectoryClean returns false when status is not empty", () => {
		(childProcess.execSync as any).mockReturnValue(" M file.txt\n");
		expect(isWorkingDirectoryClean()).toBe(false);
	});

	it("getUntrackedFiles returns array of files", () => {
		(childProcess.execSync as any).mockReturnValue("file1.txt\nfile2.txt\n");
		expect(getUntrackedFiles()).toEqual(["file1.txt", "file2.txt"]);
	});

	it("getUntrackedFiles returns empty array on empty output", () => {
		(childProcess.execSync as any).mockReturnValue("");
		expect(getUntrackedFiles()).toEqual([]);
	});

	it("getModifiedFiles returns array of files", () => {
		(childProcess.execSync as any).mockReturnValue("mod1.txt\nmod2.txt\n");
		expect(getModifiedFiles()).toEqual(["mod1.txt", "mod2.txt"]);
	});

	it("getModifiedFiles returns empty array on empty output", () => {
		(childProcess.execSync as any).mockReturnValue("");
		expect(getModifiedFiles()).toEqual([]);
	});

	it("getStagedFiles returns array of files", () => {
		(childProcess.execSync as any).mockReturnValue("stage1.txt\nstage2.txt\n");
		expect(getStagedFiles()).toEqual(["stage1.txt", "stage2.txt"]);
	});

	it("getStagedFiles returns empty array on empty output", () => {
		(childProcess.execSync as any).mockReturnValue("");
		expect(getStagedFiles()).toEqual([]);
	});

	it("getLastCommit returns trimmed commit hash", () => {
		(childProcess.execSync as any).mockReturnValue("abc1234\n");
		expect(getLastCommit()).toBe("abc1234");
	});

	it("getLastCommit returns empty string on error", () => {
		(childProcess.execSync as any).mockImplementation(() => {
		throw new Error("fail");
		});
		expect(getLastCommit()).toBe("");
	});

	it("getRemoteUrl returns trimmed remote URL", () => {
		(childProcess.execSync as any).mockReturnValue("https://github.com/user/repo.git\n");
		expect(getRemoteUrl()).toBe("https://github.com/user/repo.git");
	});

	it("getRemoteUrl returns undefined on error", () => {
		(childProcess.execSync as any).mockImplementation(() => {
		throw new Error("fail");
		});
		expect(getRemoteUrl()).toBeUndefined();
	});

	it("getGitContext returns full context", () => {
		(childProcess.execSync as any).mockImplementation((cmd: string) => {
		switch (cmd) {
			case "git branch --show-current":
			return "main\n";
			case "git status --porcelain":
			return "";
			case "git ls-files --others --exclude-standard":
			return "untracked.txt\n";
			case "git diff --name-only":
			return "modified.txt\n";
			case "git diff --cached --name-only":
			return "staged.txt\n";
			case "git rev-parse HEAD":
			return "abc1234def5678\n";
			case "git config --get remote.origin.url":
			return "https://github.com/user/repo.git\n";
			default:
			return "";
		}
		});

		const context = getGitContext();

		expect(context).toEqual<GitContext>({
		currentBranch: "main",
		isClean: true,
		untrackedFiles: ["untracked.txt"],
		modifiedFiles: ["modified.txt"],
		stagedFiles: ["staged.txt"],
		lastCommit: "abc1234def5678",
		remoteUrl: "https://github.com/user/repo.git",
		});
	});

	it("formatGitContextForLLM formats string correctly", () => {
		const ctx: GitContext = {
		currentBranch: "main",
		isClean: false,
		untrackedFiles: ["file1.ts"],
		modifiedFiles: ["file2.ts"],
		stagedFiles: ["file3.ts"],
		lastCommit: "abcdef1234567890",
		remoteUrl: "https://github.com/user/repo.git",
		};

		const formatted = formatGitContextForLLM(ctx);

		expect(formatted).toContain("Branch: main");
		expect(formatted).toContain("Working directory clean: No");
		expect(formatted).toContain("Modified files: file2.ts");
		expect(formatted).toContain("Staged files: file3.ts");
		expect(formatted).toContain("Untracked files: file1.ts");
		expect(formatted).toContain("Last commit: abcdef12");
		expect(formatted).toContain("Remote: https://github.com/user/repo.git");
	});
});
