/**
 * Represents a dependency with its name and version
 */
export type Dependency = {
  name: string;
  version: string;
  hash?: string;
};

export type CheckDependenciesResult = {
  lockedPackage: Dependency;
  compromisedPackage: Dependency;
  type: "name_match" | "version_match";
};
