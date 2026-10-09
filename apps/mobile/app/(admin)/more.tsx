import AccountPanel from "../../components/staff/AccountPanel";
import { Screen } from "../../components/staff/ui";

export default function AdminMore() {
  return (
    <Screen title="المزيد" subtitle="حسابك وإعدادات التطبيق">
      <AccountPanel roleLabel="مدير" />
    </Screen>
  );
}
