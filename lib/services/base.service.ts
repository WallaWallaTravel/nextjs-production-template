/**
 * Base Service Class
 *
 * Abstract base class providing common functionality for all service classes.
 * Implements the Service Layer pattern with standardized database operations,
 * error handling, and structured logging.
 *
 * @example
 * ```typescript
 * import { BaseService } from './base.service';
 *
 * export class UserService extends BaseService {
 *   protected get serviceName() { return 'UserService'; }
 *   protected get tableName() { return 'users'; }
 *
 *   async getActiveUsers() {
 *     return this.findWhere({ is_active: true });
 *   }
 * }
 * ```
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export interface PaginationParams {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export abstract class BaseService {
  protected supabase: SupabaseClient;

  constructor() {
    this.supabase = getSupabaseAdmin();
  }

  // Service name for logging
  protected abstract get serviceName(): string;

  // Table name for CRUD operations
  protected abstract get tableName(): string;

  // ============================================================================
  // Query Methods
  // ============================================================================

  /**
   * Find record by ID
   */
  protected async findById<T = unknown>(
    id: string | number,
    columns: string = '*'
  ): Promise<T | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(columns)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data as T;
    } catch (error) {
      this.handleError(error, 'findById');
      throw error;
    }
  }

  /**
   * Find records matching conditions
   */
  protected async findWhere<T = unknown>(
    conditions: Record<string, unknown>,
    columns: string = '*',
    options?: { limit?: number; orderBy?: string; orderDirection?: 'asc' | 'desc' }
  ): Promise<T[]> {
    try {
      let query = this.supabase.from(this.tableName).select(columns);

      // Apply conditions
      for (const [key, value] of Object.entries(conditions)) {
        if (value === null) {
          query = query.is(key, null);
        } else if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      }

      // Apply ordering
      if (options?.orderBy) {
        query = query.order(options.orderBy, {
          ascending: options.orderDirection !== 'desc',
        });
      }

      // Apply limit
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as T[];
    } catch (error) {
      this.handleError(error, 'findWhere');
      throw error;
    }
  }

  /**
   * Find first record matching conditions
   */
  protected async findOne<T = unknown>(
    conditions: Record<string, unknown>,
    columns: string = '*'
  ): Promise<T | null> {
    const results = await this.findWhere<T>(conditions, columns, { limit: 1 });
    return results[0] || null;
  }

  /**
   * Check if a record exists
   */
  protected async exists(conditions: Record<string, unknown>): Promise<boolean> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('id', { count: 'exact', head: true });

      for (const [key, value] of Object.entries(conditions)) {
        if (value === null) {
          query = query.is(key, null);
        } else {
          query = query.eq(key, value);
        }
      }

      const { count, error } = await query;

      if (error) throw error;
      return (count || 0) > 0;
    } catch (error) {
      this.handleError(error, 'exists');
      throw error;
    }
  }

  /**
   * Count records matching conditions
   */
  protected async count(conditions?: Record<string, unknown>): Promise<number> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      if (conditions) {
        for (const [key, value] of Object.entries(conditions)) {
          if (value === null) {
            query = query.is(key, null);
          } else {
            query = query.eq(key, value);
          }
        }
      }

      const { count, error } = await query;

      if (error) throw error;
      return count || 0;
    } catch (error) {
      this.handleError(error, 'count');
      throw error;
    }
  }

  // ============================================================================
  // CRUD Operations
  // ============================================================================

  /**
   * Insert a record
   */
  protected async insert<T = unknown>(
    data: Record<string, unknown>,
    returning: string = '*'
  ): Promise<T> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert(data)
        .select(returning)
        .single();

      if (error) throw error;
      return result as T;
    } catch (error) {
      this.handleError(error, 'insert');
      throw error;
    }
  }

  /**
   * Insert multiple records
   */
  protected async insertMany<T = unknown>(
    records: Record<string, unknown>[],
    returning: string = '*'
  ): Promise<T[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .insert(records)
        .select(returning);

      if (error) throw error;
      return (data || []) as T[];
    } catch (error) {
      this.handleError(error, 'insertMany');
      throw error;
    }
  }

  /**
   * Update a record by ID
   */
  protected async update<T = unknown>(
    id: string | number,
    data: Record<string, unknown>,
    returning: string = '*'
  ): Promise<T | null> {
    try {
      const updates = { ...data, updated_at: new Date().toISOString() };
      delete updates.id; // Don't allow updating ID

      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .update(updates)
        .eq('id', id)
        .select(returning)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return result as T;
    } catch (error) {
      this.handleError(error, 'update');
      throw error;
    }
  }

  /**
   * Update records matching conditions
   */
  protected async updateWhere<T = unknown>(
    conditions: Record<string, unknown>,
    data: Record<string, unknown>,
    returning: string = '*'
  ): Promise<T[]> {
    try {
      const updates = { ...data, updated_at: new Date().toISOString() };

      let query = this.supabase.from(this.tableName).update(updates);

      for (const [key, value] of Object.entries(conditions)) {
        if (value === null) {
          query = query.is(key, null);
        } else {
          query = query.eq(key, value);
        }
      }

      const { data: result, error } = await query.select(returning);

      if (error) throw error;
      return (result || []) as T[];
    } catch (error) {
      this.handleError(error, 'updateWhere');
      throw error;
    }
  }

  /**
   * Delete a record by ID
   */
  protected async delete(id: string | number): Promise<boolean> {
    try {
      const { error, count } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return (count || 0) > 0;
    } catch (error) {
      this.handleError(error, 'delete');
      throw error;
    }
  }

  /**
   * Soft delete (set deleted_at)
   */
  protected async softDelete(id: string | number): Promise<boolean> {
    try {
      const { error, count } = await this.supabase
        .from(this.tableName)
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .is('deleted_at', null);

      if (error) throw error;
      return (count || 0) > 0;
    } catch (error) {
      this.handleError(error, 'softDelete');
      throw error;
    }
  }

  // ============================================================================
  // Pagination
  // ============================================================================

  /**
   * Paginate query results
   */
  protected async paginate<T = unknown>(
    params: PaginationParams = {},
    conditions?: Record<string, unknown>,
    columns: string = '*'
  ): Promise<PaginatedResult<T>> {
    const limit = Math.min(params.limit || 50, 100);
    const offset = params.offset || 0;

    try {
      // Get total count
      const total = await this.count(conditions);

      // Get paginated data
      let query = this.supabase
        .from(this.tableName)
        .select(columns)
        .range(offset, offset + limit - 1);

      // Apply conditions
      if (conditions) {
        for (const [key, value] of Object.entries(conditions)) {
          if (value === null) {
            query = query.is(key, null);
          } else if (Array.isArray(value)) {
            query = query.in(key, value);
          } else {
            query = query.eq(key, value);
          }
        }
      }

      // Apply ordering
      if (params.orderBy) {
        query = query.order(params.orderBy, {
          ascending: params.orderDirection !== 'desc',
        });
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        data: (data || []) as T[],
        total,
        limit,
        offset,
        hasMore: offset + (data?.length || 0) < total,
      };
    } catch (error) {
      this.handleError(error, 'paginate');
      throw error;
    }
  }

  // ============================================================================
  // Upsert
  // ============================================================================

  /**
   * Insert or update a record
   */
  protected async upsert<T = unknown>(
    data: Record<string, unknown>,
    conflictColumns: string | string[] = 'id',
    returning: string = '*'
  ): Promise<T> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .upsert(data, {
          onConflict: Array.isArray(conflictColumns)
            ? conflictColumns.join(',')
            : conflictColumns,
        })
        .select(returning)
        .single();

      if (error) throw error;
      return result as T;
    } catch (error) {
      this.handleError(error, 'upsert');
      throw error;
    }
  }

  // ============================================================================
  // Error Handling
  // ============================================================================

  /**
   * Handle and log service errors
   */
  protected handleError(error: unknown, context: string): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));

    logger.error(`${this.serviceName} Error [${context}]`, {
      service: this.serviceName,
      context,
      error: errorObj.message,
      stack: process.env.NODE_ENV === 'development' ? errorObj.stack : undefined,
    });
  }

  // ============================================================================
  // Logging Helpers
  // ============================================================================

  /**
   * Log service activity
   */
  protected log(message: string, data?: Record<string, unknown>): void {
    logger.info(`${this.serviceName}: ${message}`, data);
  }

  /**
   * Log warning
   */
  protected warn(message: string, data?: Record<string, unknown>): void {
    logger.warn(`${this.serviceName}: ${message}`, data);
  }
}
