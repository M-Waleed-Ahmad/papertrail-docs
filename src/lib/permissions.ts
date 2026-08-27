export function canManageSharing(isOwner: boolean) {
  return isOwner;
}

export function canEditDocument(isOwner: boolean, isSharedEditor: boolean) {
  return isOwner || isSharedEditor;
}
