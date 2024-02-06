import { ReactElement } from "react";
import Head from "next/head";
import DashboardLayout from "src/components/dashboard-layout/DashboardLayout";

const PropagatedPage = () => {
  return (
    <>
      <Head>
        <title>Page</title>
      </Head>
    </>
  );
};

PropagatedPage.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default PropagatedPage;
