import { useNavigate } from 'react-router-dom';
import Card from '../Components/common/Card';
import Alert from '../Components/common/Alert';
import StudentFormHeader from '../Components/students/addstudent/StudentFormHeader';
import StudentFormFields from '../Components/students/addstudent/StudentFormFields';
import StudentFormActions from '../Components/students/addstudent/StudentFormActions';
import { useStudentForm } from '../hooks/useStudentForm';
import { BATCH_CHOICES, STATUS_CHOICES } from '../constants/studentConstants';

export default function AddStudentPage() {
  const navigate = useNavigate();

  const {
    formData,
    trainers,
    trainersLoading,
    loading,
    errors,
    handleChange,
    submitStudent,
  } = useStudentForm();

  const handleSubmit = (e) => {
    e.preventDefault();
    submitStudent(() => navigate('/students'));
  };

  const handleCancel = () => {
    navigate('/students');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <StudentFormHeader onBack={handleCancel} />

        <form onSubmit={handleSubmit}>
          {errors.submit && (
            <Alert type="error" message={errors.submit} className="mb-6" />
          )}

          <Card padding="p-6">
            <StudentFormFields
              formData={formData}
              errors={errors}
              trainers={trainers}
              trainersLoading={trainersLoading}
              onChange={handleChange}
              batchChoices={BATCH_CHOICES}
              statusChoices={STATUS_CHOICES}
            />

            <StudentFormActions
              onCancel={handleCancel}
              loading={loading}
              disabled={trainersLoading}
            />
          </Card>
        </form>
      </div>
    </div>
  );
}
