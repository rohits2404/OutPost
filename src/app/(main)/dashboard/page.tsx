import { checkUser } from "@/lib/actions/check-user";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";

const DashboardPage = async () => {
    const user = await checkUser();
    if (!user) redirect("/sign-in");

    return (
        <div>
            <UserButton />
        </div>
    );
};

export default DashboardPage;
