import { Button } from "../components/ui/button";
import { SurveyForm } from "../components/SurveyForm";

export function TakeSurvey({ survey, onBack, onSubmit }) {
    return (
        <div className="space-y-6">
            <Button onClick={onBack} variant="outline" className="border-[#778da9] text-[#415a77] hover:bg-white">
                ← Back to Surveys
            </Button>
            <SurveyForm survey={survey} onSubmit={onSubmit} />
        </div>
    );
}
