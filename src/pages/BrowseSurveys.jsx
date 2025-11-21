import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { SurveyList } from "../components/SurveyList";

export function BrowseSurveys({ surveys, drafts, onTakeSurvey, onViewResults, onPublishDraft, onDeleteDraft, onEditDraft }) {
    return (
        <Tabs defaultValue="available" className="space-y-6">
            <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-4 bg-[#1b263b]">
                <TabsTrigger value="available" className="data-[state=active]:bg-[#415a77] data-[state=active]:text-white text-[#778da9]">
                    Available Surveys
                </TabsTrigger>
                <TabsTrigger value="closed" className="data-[state=active]:bg-[#415a77] data-[state=active]:text-white text-[#778da9]">
                    Past Surveys
                </TabsTrigger>
                <TabsTrigger value="create" className="data-[state=active]:bg-[#415a77] data-[state=active]:text-white text-[#778da9]">
                    Create Survey
                </TabsTrigger>
                <TabsTrigger value="drafts" className="data-[state=active]:bg-[#415a77] data-[state=active]:text-white text-[#778da9]">
                    Drafts
                </TabsTrigger>
            </TabsList>

            <TabsContent value="available" className="space-y-6">
                <SurveyList
                    surveys={surveys.filter(s => s.status === "published")}
                    onTakeSurvey={onTakeSurvey}
                    onViewResults={onViewResults}
                />
            </TabsContent>

            <TabsContent value="closed" className="space-y-6">
                <SurveyList
                    surveys={surveys.filter(s => s.status === "closed" && s.createdBy === "me")}
                    onTakeSurvey={onTakeSurvey}
                    onViewResults={onViewResults}
                    isPastSurveys
                />
            </TabsContent>

            <TabsContent value="create" className="space-y-6">
                {/* Optionally import CreateSurvey directly here if you want inline */}
            </TabsContent>

            <TabsContent value="drafts" className="space-y-6">
                <SurveyList
                    surveys={drafts}
                    onTakeSurvey={onTakeSurvey}
                    onViewResults={onViewResults}
                    isDrafts
                    onPublishDraft={onPublishDraft}
                    onDeleteDraft={onDeleteDraft}
                    onEditDraft={onEditDraft}
                />
            </TabsContent>
        </Tabs>
    );
}
