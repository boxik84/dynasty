// Lightweight MySQL adapter built on top of Kysely so we can use Better Auth without Prisma.
import { createAdapter } from "better-auth/adapters";
import type { AdapterDebugLogs } from "better-auth/adapters";
import type { Kysely } from "kysely";

type WhereClause = {
  field: string;
  value: any;
  operator?: string;
  connector?: "AND" | "OR";
};

type SortBy = {
  field: string;
  direction: "asc" | "desc";
};

interface MysqlAdapterConfig {
  usePlural?: boolean;
  debugLogs?: AdapterDebugLogs;
}

export const mysqlAdapter = (db: Kysely<any>, config?: MysqlAdapterConfig) =>
  createAdapter({
    config: {
      adapterId: "mysql-kysely",
      adapterName: "MySQL Adapter",
      usePlural: config?.usePlural,
      debugLogs: config?.debugLogs,
      supportsBooleans: true,
      supportsDates: true,
      supportsJSON: false,
    },
    adapter: ({ getFieldName, schema }) => {
      const fetchAfterWrite = async (
        values: Record<string, any>,
        builder: any,
        model: string,
        where: WhereClause[]
      ) => {
        await builder.execute();
        const lookupField = values.id
          ? "id"
          : where.length > 0 && where[0]?.field
          ? where[0].field
          : "id";
        const fieldName = getFieldName({ model, field: lookupField });
        const lookupValue = values[lookupField] ?? where[0]?.value;
        if (lookupValue === undefined || lookupValue === null) {
          const latest = await db
            .selectFrom(model)
            .selectAll()
            .orderBy(fieldName, "desc")
            .limit(1)
            .executeTakeFirst();
          return latest ?? null;
        }
        const row = await db
          .selectFrom(model)
          .selectAll()
          .where(fieldName, "=", lookupValue)
          .limit(1)
          .executeTakeFirst();
        return row ?? null;
      };

      const normalizeValue = (value: any, model: string, field: string) => {
        if (field === "id") {
          return value;
        }
        const table = schema[model];
        const column = table?.fields[field];
        if (!column) {
          return value;
        }
        if (column.type === "boolean" && typeof value === "boolean") {
          return value ? 1 : 0;
        }
        if (column.type === "date" && value instanceof Date) {
          return value;
        }
        return value;
      };

      const buildWhere = (model: string, clauses?: WhereClause[]) => {
        if (!clauses || clauses.length === 0) {
          return { and: null, or: null } as const;
        }

        const and: Array<(eb: any) => any> = [];
        const or: Array<(eb: any) => any> = [];

        for (const clause of clauses) {
          const { field, value, operator = "=", connector = "AND" } = clause;
          const dbField = getFieldName({ model, field });
          const dbValue = normalizeValue(value, model, field);

          const expr = (eb: any) => {
            switch (operator.toLowerCase()) {
              case "in":
                return eb(dbField, "in", Array.isArray(dbValue) ? dbValue : [dbValue]);
              case "contains":
                return eb(dbField, "like", `%${dbValue}%`);
              case "starts_with":
                return eb(dbField, "like", `${dbValue}%`);
              case "ends_with":
                return eb(dbField, "like", `%${dbValue}`);
              case "eq":
              case "=":
                return eb(dbField, "=", dbValue);
              case "ne":
                return eb(dbField, "<>", dbValue);
              case "gt":
                return eb(dbField, ">", dbValue);
              case "gte":
                return eb(dbField, ">=", dbValue);
              case "lt":
                return eb(dbField, "<", dbValue);
              case "lte":
                return eb(dbField, "<=", dbValue);
              default:
                return eb(dbField, operator, dbValue);
            }
          };

          if (connector === "OR") {
            or.push(expr);
          } else {
            and.push(expr);
          }
        }

        return {
          and: and.length ? and : null,
          or: or.length ? or : null,
        } as const;
      };

      return {
        async create({ data, model }: { data: Record<string, any>; model: string }) {
          const builder = db.insertInto(model).values(data);
          return await fetchAfterWrite(data, builder, model, []);
        },
        async findOne({
          model,
          where,
        }: {
          model: string;
          where: WhereClause[] | undefined;
        }) {
          const { and, or } = buildWhere(model, where);
          let query = db.selectFrom(model).selectAll();
          if (and) {
            query = query.where((eb) => eb.and(and.map((expr) => expr(eb))));
          }
          if (or) {
            query = query.where((eb) => eb.or(or.map((expr) => expr(eb))));
          }
          const row = await query.executeTakeFirst();
          return row ?? null;
        },
        async findMany({
          model,
          where,
          limit,
          offset,
          sortBy,
        }: {
          model: string;
          where: WhereClause[] | undefined;
          limit?: number;
          offset?: number;
          sortBy?: SortBy;
        }) {
          const { and, or } = buildWhere(model, where);
          let query = db.selectFrom(model).selectAll();
          if (and) {
            query = query.where((eb) => eb.and(and.map((expr) => expr(eb))));
          }
          if (or) {
            query = query.where((eb) => eb.or(or.map((expr) => expr(eb))));
          }
          if (sortBy) {
            query = query.orderBy(getFieldName({ model, field: sortBy.field }), sortBy.direction);
          }
          if (typeof offset === "number" && offset > 0) {
            query = query.offset(offset);
          }
          query = query.limit(limit || 100);
          return await query.execute();
        },
        async count({ model, where }: { model: string; where: WhereClause[] | undefined }) {
          const { and, or } = buildWhere(model, where);
          let query = db.selectFrom(model).select((qb) => qb.fn.count("id").as("count"));
          if (and) {
            query = query.where((eb) => eb.and(and.map((expr) => expr(eb))));
          }
          if (or) {
            query = query.where((eb) => eb.or(or.map((expr) => expr(eb))));
          }
          const result = await query.executeTakeFirst();
          return Number(result?.count ?? 0);
        },
        async update({
          model,
          where,
          update: values,
        }: {
          model: string;
          where: WhereClause[] | undefined;
          update: Record<string, any>;
        }) {
          const { and, or } = buildWhere(model, where);
          let query = db.updateTable(model).set(values);
          if (and) {
            query = query.where((eb) => eb.and(and.map((expr) => expr(eb))));
          }
          if (or) {
            query = query.where((eb) => eb.or(or.map((expr) => expr(eb))));
          }
          return await fetchAfterWrite(values, query, model, where ?? []);
        },
        async updateMany({
          model,
          where,
          update: values,
        }: {
          model: string;
          where: WhereClause[] | undefined;
          update: Record<string, any>;
        }) {
          const { and, or } = buildWhere(model, where);
          let query = db.updateTable(model).set(values);
          if (and) {
            query = query.where((eb) => eb.and(and.map((expr) => expr(eb))));
          }
          if (or) {
            query = query.where((eb) => eb.or(or.map((expr) => expr(eb))));
          }
          const result = await query.execute();
          return Array.isArray(result) ? result.length : 0;
        },
        async delete({ model, where }: { model: string; where: WhereClause[] | undefined }) {
          const { and, or } = buildWhere(model, where);
          let query = db.deleteFrom(model);
          if (and) {
            query = query.where((eb) => eb.and(and.map((expr) => expr(eb))));
          }
          if (or) {
            query = query.where((eb) => eb.or(or.map((expr) => expr(eb))));
          }
          await query.execute();
        },
        async deleteMany({ model, where }: { model: string; where: WhereClause[] | undefined }) {
          const { and, or } = buildWhere(model, where);
          let query = db.deleteFrom(model);
          if (and) {
            query = query.where((eb) => eb.and(and.map((expr) => expr(eb))));
          }
          if (or) {
            query = query.where((eb) => eb.or(or.map((expr) => expr(eb))));
          }
          const result = await query.execute();
          return Array.isArray(result) ? result.length : 0;
        },
        options: {
          adapterId: "mysql-kysely",
          adapterName: "MySQL Adapter",
          usePlural: config?.usePlural,
          debugLogs: config?.debugLogs,
          supportsBooleans: true,
          supportsDates: true,
          supportsJSON: false,
        },
      } as any;
    },
  });
