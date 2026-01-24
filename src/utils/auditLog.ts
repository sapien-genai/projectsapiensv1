import { supabase } from '../lib/supabase';

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'view'
  | 'export'
  | 'assign'
  | 'approve'
  | 'reject'
  | 'suspend'
  | 'restore'
  | 'grant_access'
  | 'revoke_access'
  | 'change_role'
  | 'change_plan';

export type TargetType =
  | 'user'
  | 'ticket'
  | 'project'
  | 'badge'
  | 'role'
  | 'feature_flag'
  | 'billing'
  | 'network_access'
  | 'metrics'
  | 'system_settings';

interface AuditLogEntry {
  action: AuditAction;
  targetType: TargetType;
  targetId?: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
}

class AuditLogger {
  async logAction(entry: AuditLogEntry): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error('Cannot log audit action: No authenticated user');
        return;
      }

      const auditPayload = {
        admin_user_id: user.id,
        action: entry.action,
        target_type: entry.targetType,
        target_id: entry.targetId || null,
        changes: {
          ...entry.changes,
          ...entry.metadata,
          timestamp: new Date().toISOString(),
        },
        ip_address: null,
      };

      const { error } = await supabase
        .from('system_audit_log')
        .insert([auditPayload]);

      if (error) {
        console.error('Audit log error:', error);
      }
    } catch (error) {
      console.error('Failed to log audit action:', error);
    }
  }

  async logUserAction(
    action: AuditAction,
    userId: string,
    changes?: Record<string, any>
  ): Promise<void> {
    await this.logAction({
      action,
      targetType: 'user',
      targetId: userId,
      changes,
    });
  }

  async logTicketAction(
    action: AuditAction,
    ticketId: string,
    changes?: Record<string, any>
  ): Promise<void> {
    await this.logAction({
      action,
      targetType: 'ticket',
      targetId: ticketId,
      changes,
    });
  }

  async logProjectAction(
    action: AuditAction,
    projectId: string,
    changes?: Record<string, any>
  ): Promise<void> {
    await this.logAction({
      action,
      targetType: 'project',
      targetId: projectId,
      changes,
    });
  }

  async logRoleChange(
    userId: string,
    oldRole: string | null,
    newRole: string,
    permissions?: Record<string, boolean>
  ): Promise<void> {
    await this.logAction({
      action: 'change_role',
      targetType: 'role',
      targetId: userId,
      changes: {
        old_role: oldRole,
        new_role: newRole,
        permissions,
      },
    });
  }

  async logPlanChange(
    userId: string,
    oldPlan: string,
    newPlan: string,
    reason?: string
  ): Promise<void> {
    await this.logAction({
      action: 'change_plan',
      targetType: 'billing',
      targetId: userId,
      changes: {
        old_plan: oldPlan,
        new_plan: newPlan,
        reason,
      },
    });
  }

  async logAccessChange(
    userId: string,
    accessType: string,
    granted: boolean,
    reason?: string
  ): Promise<void> {
    await this.logAction({
      action: granted ? 'grant_access' : 'revoke_access',
      targetType: 'network_access',
      targetId: userId,
      changes: {
        access_type: accessType,
        reason,
      },
    });
  }

  async logDataExport(
    dataType: string,
    recordCount: number,
    filters?: Record<string, any>
  ): Promise<void> {
    await this.logAction({
      action: 'export',
      targetType: 'metrics',
      changes: {
        data_type: dataType,
        record_count: recordCount,
        filters,
      },
    });
  }

  async logBulkAction(
    action: AuditAction,
    targetType: TargetType,
    targetIds: string[],
    changes?: Record<string, any>
  ): Promise<void> {
    await this.logAction({
      action,
      targetType,
      changes: {
        ...changes,
        bulk_operation: true,
        target_count: targetIds.length,
        target_ids: targetIds,
      },
    });
  }
}

export const auditLog = new AuditLogger();
