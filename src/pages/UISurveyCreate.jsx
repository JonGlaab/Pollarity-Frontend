import { CreateSurvey } from "../components/CreateSurvey";

export function UISurveyCreate({ onCreate, onSaveDraft }) {
    return (
        <CreateSurvey onCreate={onCreate} onSaveDraft={onSaveDraft} />
    );
}