import {
  getRoleForDocument as getStoreRoleForDocument,
  listDocumentsForUser as listStoreDocuments,
  type Role
} from "@/lib/store";

export { listStoreDocuments as listDocumentsForUser, getStoreRoleForDocument as getRoleForDocument };

export function canEdit(role: Role | null) {
  return role === "OWNER" || role === "EDITOR";
}

export function canManageMembers(role: Role | null) {
  return role === "OWNER";
}
