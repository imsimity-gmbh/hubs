import { useCallback, useContext } from "react";
import { usePaginatedAPI } from "./usePaginatedAPI";
import { fetchReticulumAuthenticated } from "../../utils/phoenix-utils";
import { AuthContext } from "../auth/AuthContext";

export function useAvatarList() {
  const auth = useContext(AuthContext); // Re-render when you log in/out.
  const getMoreAvatars = useCallback(
    cursor => {
      if (auth.userId) {
        return fetchReticulumAuthenticated(
          `/api/v1/media/search?source=avatar&user=${auth.userId}&cursor=${cursor}`
        );
      } else {
        return Promise.reject(new Error("Not signed in"));
      }
    },
    [auth.userId]
  );
  return usePaginatedAPI(getMoreAvatars);
}
