import { Button } from "../components/ui/button";
import { SurveyResults } from "../components/SurveyResults";

export function SurveyResultsPage({ survey, onBack }) {
    return (
        <div className="space-y-6">
            <Button onClick={onBack} variant="outline" className="border-[#778da9] text-[#415a77] hover:bg-white">
                ← Back to Surveys
            </Button>
            <SurveyResults survey={survey} />
        </div>
    );
}