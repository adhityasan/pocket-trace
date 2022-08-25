import { useMemo, useState } from "react";

import { useLocationContext } from "@contexts/locationContext";
import { TRACE_API } from "@services/apis/api";
import { APP_API_BASE_URL } from "@services/constants/extra";
import Fetcher from "@services/utils/fetcher";

import useAuth from "./useAuth";

const useTrace = () => {
  const { token } = useAuth();
  const [error, setError] = useState<Error | undefined | null>();
  const { setLocationState } = useLocationContext();
  const [traces, setTraces] = useState<Trace[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const fetcher = useMemo(() => {
    return new Fetcher(APP_API_BASE_URL, {
      headers: {
        Authorization: token
      }
    });
  }, []);

  const saveTrace = async (name: string, recordedLocations: any[]): Promise<any> => {
    setIsSaving(true);
    try {
      const res = await fetcher.post(TRACE_API, { name, locations: recordedLocations });
      setError(null);
      return res;
    } catch (error) {
      setError(error as Error);
      return Promise.reject(error);
    } finally {
      setIsSaving(false);
    }
  };

  const fetchTraces = async () => {
    try {
      setIsFetching(true);
      const res: Trace[] = await fetcher.get(TRACE_API);
      setTraces(res);
      setLocationState({ records: [] });
      setError(null);
    } catch (error) {
      setError(error as Error);
    } finally {
      setIsFetching(false);
    }
  };

  const discardRecordedTraces = () => {
    setLocationState({ records: [] });
  };

  return { error, traces, isSaving, isFetching, saveTrace, discardRecordedTraces, fetchTraces };
};

export default useTrace;
