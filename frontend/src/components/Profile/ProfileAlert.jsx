import Alert from "@/components/Auth/Alert";

export default function ProfileAlert({ alert, onClose }) {
  if (!alert.show) return null;
  return (
    <div className="fixed top-4 right-4 z-50">
      <Alert 
        type={alert.type} 
        message={alert.message} 
        onClose={onClose}
      />
    </div>
  );
}