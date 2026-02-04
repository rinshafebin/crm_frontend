import React from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import ContactSection from '../newlead/ContactSection'
import LeadDetailsSection from '../newlead/LeadDetailsSection'
import AdditionalInfoSection from '../newlead/AdditionalInfoSection'
import AssignedToSection from '../newlead/AssignedToSection';
import Alert from '../../common/Alert'
import Card from '../../common/Card';
import Button from '../../common/Button';

export default function EditLeadFormUI({
  formData,
  errors,
  apiError,
  submitted,
  submitting,
  handleInputChange,
  handleSubmit,
  handleBack
}) {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Leads
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Lead</h1>
          <p className="mt-2 text-gray-600">Update the lead information below</p>
        </div>

        {/* Success Message */}
        {submitted && (
          <Alert type="success" className="mb-6">
            Lead updated successfully! Redirecting...
          </Alert>
        )}

        {/* API Error Message */}
        {apiError && (
          <Alert type="error" className="mb-6">
            {apiError}
          </Alert>
        )}

        {/* Form Card */}
        <Card className="mb-6">
          <div className="space-y-8">
            <ContactSection
              formData={formData}
              errors={errors}
              handleInputChange={handleInputChange}
            />

            <LeadDetailsSection
              formData={formData}
              errors={errors}
              handleInputChange={handleInputChange}
            />

            <AdditionalInfoSection
              formData={formData}
              errors={errors}
              handleInputChange={handleInputChange}
            />

            <AssignedToSection
              formData={formData}
              errors={errors}
              handleInputChange={handleInputChange}
            />
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end mb-6">
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
          >
            <Save className="h-5 w-5 mr-2" />
            {submitting ? 'Updating...' : 'Update Lead'}
          </Button>

          <Button
            onClick={handleBack}
            variant="outline"
            disabled={submitting}
            className="px-6 py-2"
          >
            Cancel
          </Button>
        </div>

        {/* Info Alert */}
        <Alert type="info">
          <strong>Note:</strong> Fields marked with * are required. Assignment changes will be
          reflected immediately after updating.
        </Alert>
      </div>
    </div>
  );
}