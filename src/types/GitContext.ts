export default interface GitContext {
  currentBranch: string;
  isClean: boolean;
  untrackedFiles: string[];
  modifiedFiles: string[];
  stagedFiles: string[];
  lastCommit: string;
  remoteUrl?: string;
}