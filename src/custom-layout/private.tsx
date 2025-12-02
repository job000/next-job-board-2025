import React, { useEffect } from "react";
import Header from "./header";
import { getLoggedInUser } from "@/actions/users";
import toast from "react-hot-toast";
import useUsersStore, { IUsersStore } from "@/store/users-store";
import Cookie from "js-cookie";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/spinner";

function PrivateLayout({ children }: { children: React.ReactNode }) {
  const { setUser }: IUsersStore = useUsersStore() as IUsersStore;
  const [loading, setLoading] = React.useState<boolean>(true);
  const router = useRouter();

  const fetchUser = async () => {
    setLoading(true);
    const response = await getLoggedInUser();
    if (!response.success) {
      toast.error(response.message);
      Cookie.remove("token");
      router.push("/login");
      return;
    }
    setUser(response.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) {
    return (
      <Spinner />
    );
  }

  return (
    <div>
      <Header />

      <div className="p-5">{children}</div>
    </div>
  );
}

export default PrivateLayout;