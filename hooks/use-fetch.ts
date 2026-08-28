"use client";

import { useState } from "react";

const useFetch = <TData, TArgs extends unknown[]>(
  cb: (...args: TArgs) => Promise<TData>,
) => {
  const [data, setData] = useState<TData | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fn = async (...args: TArgs) => {
    setLoading(true);
    setError(null);

    try {
      const response = await cb(...args);

      setData(response);

      return response;
    } catch (error) {
      const fetchError =
        error instanceof Error ? error : new Error("Something went wrong");

      setError(fetchError);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    fn,
    setData,
  };
};

export default useFetch;
