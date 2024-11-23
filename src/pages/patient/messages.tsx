import { Messages } from '@/components/Messages';
import DashboardLayout from '@/components/DashboardLayout';
import { withAuth } from '@/components/withAuth';
import { getMenuItems } from '@/store/menuStore';

function PatientMessages() {
  const menuItems = getMenuItems('patient');
  
  return (
    <DashboardLayout title="Messages" menuItems={menuItems}>
      <Messages />
    </DashboardLayout>
  );
}

export default withAuth(PatientMessages, { requiredRole: 'patient' });