import { http } from "@/lib/http";

export type ListParams = {
  page?: number;
  perPage?: number;
  filters?: Record<string, any>;
  sort?: Record<string, "asc" | "desc">;
};

export type NormalizedCollection<T> = {
  member: T[];
  totalItems: number;
  raw?: any;
};

const buildQuery = (params?: ListParams) => {
  const q = new URLSearchParams();
  if (!params) return "";

  if (params.filters) {
    for (const [k, v] of Object.entries(params.filters)) {
      if (v !== undefined && v !== null && String(v).length) {
        q.append(k, String(v));
      }
    }
  }

  if (params.sort) {
    for (const [k, v] of Object.entries(params.sort)) {
      q.append(`order[${k}]`, v);
      q.append(`sort[${k}]`, v);
    }
  }

  if (params.page) q.append("page", String(params.page));
  if (params.perPage) {
    q.append("itemsPerPage", String(params.perPage));
    q.append("per_page", String(params.perPage));
  }

  const qs = q.toString();
  return qs ? `?${qs}` : "";
};

function normalizeCollection<T>(data: any): NormalizedCollection<T> {
  if (data && typeof data === "object" && Array.isArray(data["hydra:member"])) {
    return {
      member: data["hydra:member"],
      totalItems: data["hydra:totalItems"] ?? data["hydra:member"].length,
      raw: data,
    };
  }

  if (data && typeof data === "object" && Array.isArray(data.member)) {
    return {
      member: data.member,
      totalItems: data.totalItems ?? data.member.length,
      raw: data,
    };
  }

  if (data && typeof data === "object" && Array.isArray(data.data)) {
    return {
      member: data.data,
      totalItems: data.meta?.total ?? data.total ?? data.data.length,
      raw: data,
    };
  }

  if (Array.isArray(data)) {
    return { member: data, totalItems: data.length, raw: data };
  }

  return { member: [], totalItems: 0, raw: data };
}

export function makeCrud<T, C = any, U = any>(basePath: string) {
  return {
    async list(params?: ListParams): Promise<NormalizedCollection<T>> {
      const { data } = await http.get(`${basePath}${buildQuery(params)}`);
      return normalizeCollection<T>(data);
    },

    async get(id: number | string): Promise<T> {
      const { data } = await http.get(`${basePath}/${id}`);
      return data;
    },

    async create(payload: C): Promise<T> {
      const { data } = await http.post(basePath, payload);
      return data;
    },

    async update(id: number | string, payload: U): Promise<T> {
      try {
        const { data } = await http.patch(`${basePath}/${id}`, payload, {
          headers: { "Content-Type": "application/merge-patch+json" },
        });
        return data;
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 405 || status === 415) {
          const { data } = await http.put(`${basePath}/${id}`, payload);
          return data;
        }
        throw err;
      }
    },

    async remove(id: number | string): Promise<void> {
      await http.delete(`${basePath}/${id}`);
    },
  };
}

export type { ListParams as CrudListParams };