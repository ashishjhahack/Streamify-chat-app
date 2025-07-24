import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from '../lib/api.js';

const useAuthUser = () => {
    const authUser = useQuery({       // This have a get request
        queryKey: ['authUser'],
        queryFn: getAuthUser,
        retry: false,   // it checks if the user is authenticated
    });
    return { isLoading: authUser.isLoading, authUser: authUser.data?.user };
}

export default useAuthUser;