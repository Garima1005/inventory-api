import db from "../db/database";

interface AuditLogInput {
  changedBy: number;
  action: string;
  entity: string;
  entityId: number;
  fieldName?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
}

export const createAuditLog = ({
  changedBy,
  action,
  entity,
  entityId,
  fieldName,
  oldValue,
  newValue,
}: AuditLogInput): void => {
  db.prepare(
    `
    INSERT INTO audit_logs (
      changed_by,
      action,
      entity,
      entity_id,
      field_name,
      old_value,
      new_value
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(
    changedBy,
    action,
    entity,
    entityId,
    fieldName ?? null,
    oldValue ?? null,
    newValue ?? null,
  );
};
