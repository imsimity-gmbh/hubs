import { useCallback, useContext } from "react";
import { usePaginatedAPI } from "./usePaginatedAPI";
import { fetchReticulumAuthenticated } from "../../utils/phoenix-utils";
import { AuthContext } from "../auth/AuthContext";

export function useActiveRooms() {
  const auth = useContext(AuthContext); // Re-render when you log in/out.
  const getMoreRooms = useCallback(
    cursor => {
      if (auth.userId) {
        return fetchReticulumAuthenticated(
          `/api/v1/media/search?source=rooms&filter=my-scenes&cursor=${cursor}`
        );
      } else {
        return Promise.reject(new Error("Not signed in"));
      }
    },
    [auth.userId]
  );
  return usePaginatedAPI(getMoreRooms);
}
