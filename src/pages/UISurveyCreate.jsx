export function UISurveyCreate({ onCreate, onSaveDraft }) {
  const handleSubmit = () => {
    const survey = {
      title: "New Survey",
      description: "This is a sample survey",
      questions: [], 
    };
    onCreate(survey);  
  };

  return (
    <div>
      <button onClick={handleSubmit}>Create Survey</button>
    </div>
  );
}
