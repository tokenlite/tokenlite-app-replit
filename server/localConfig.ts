// Local development configuration
// This handles differences between running locally vs on Replit

export const isReplit = !!process.env.REPL_ID;
export const isLocal = !isReplit;

// Mock object storage service for local development
export class LocalObjectStorageService {
  async getObjectEntityUploadURL(): Promise<string> {
    // Return a mock URL for local development
    return "https://httpbin.org/put"; // This will accept PUT requests for testing
  }

  normalizeObjectEntityPath(rawPath: string): string {
    return "/objects/mock-local-file";
  }

  async trySetObjectEntityAclPolicy(rawPath: string, aclPolicy: any): Promise<string> {
    console.log("[Local] Mock ACL policy set for:", rawPath);
    return this.normalizeObjectEntityPath(rawPath);
  }

  async searchPublicObject(filePath: string): Promise<null> {
    console.log("[Local] Public object search not available locally:", filePath);
    return null;
  }

  async downloadObject(file: any, res: any): Promise<void> {
    console.log("[Local] Object download not available locally");
    res.status(404).json({ error: "Object storage not available in local development" });
  }

  async getObjectEntityFile(objectPath: string): Promise<any> {
    throw new Error("Object storage not available in local development");
  }

  async canAccessObjectEntity(params: any): Promise<boolean> {
    return false; // No access control in local mode
  }
}