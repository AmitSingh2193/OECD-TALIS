import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/state/hooks";
import {
  fetchSessionKey,
  fetchSurveyResponses,
  fetchSurveyQuestions,
  type Question,
} from "@/state/slices/limeSurveySlice";

const LimeSurvey = () => {
  const dispatch = useAppDispatch();
  const {
    sessionKey,
    loading: isSessionLoading,
    error: sessionError,
    surveyResponse,
    surveyQuestions,
    isLoadingResponses,
    isLoadingQuestions,
    responsesError,
    questionsError,
  } = useAppSelector((state) => state.limeSurvey);

  const proxyUrl = "https://cors-anywhere.herokuapp.com/";
  const targetUrl = "https://survey.oecd.org/index.php?r=admin/remotecontrol";
  const username = import.meta.env.VITE_LIMESURVEY_USER;
  const remoteToken = import.meta.env.VITE_LIMESURVEY_TOKEN;
  const surveyId = "495561";
  const rid = localStorage.getItem("rid");

  const handleFetchSessionKey = async () => {
    if (!username || !remoteToken) {
      console.error("Missing LimeSurvey credentials");
      return;
    }

    await dispatch(
      fetchSessionKey({
        username,
        remoteToken,
        targetUrl,
      }),
    );
  };

  useEffect(() => {
    handleFetchSessionKey();
  }, []);

  const handleFetchSurveyResponses = () => {
    if (!sessionKey || !rid) return;

    dispatch(
      fetchSurveyResponses({
        sessionKey,
        surveyId,
        proxyUrl,
        targetUrl,
        responseId: rid,
      }),
    );
  };

  const handleFetchSurveyQuestions = () => {
    if (!sessionKey) return;

    dispatch(
      fetchSurveyQuestions({
        sessionKey,
        surveyId,
        proxyUrl,
        targetUrl,
      }),
    );
  };

  useEffect(() => {
    if (sessionKey) {
      handleFetchSurveyResponses();
      handleFetchSurveyQuestions();
    }
  }, [sessionKey, rid]);

  if (isSessionLoading || isLoadingResponses || isLoadingQuestions) {
    return <div>Loading...</div>;
  }

  if (sessionError || responsesError || questionsError) {
    return (
      <div className="text-red-500">
        Error: {sessionError || responsesError || questionsError}
      </div>
    );
  }

  return (
    <div className="text-left">
      <div className="py-4">
        <h1 className="text-xl font-bold">Your Submitted Responses</h1>
      </div>

      {/* Wrapping container */}
      <div className="flex flex-wrap gap-4">
        {surveyQuestions?.map((q: Question) => {
          const answer = surveyResponse ? surveyResponse[q.title] : null;

          return (
            <div
              key={q.id}
              className="bg-white border rounded-2xl shadow-sm p-4 
                         hover:shadow-md transition-all 
                         min-w-[250px] max-w-fit h-[157px]"
            >
              <p className="font-semibold text-[#1a3353] flex items-start">
                <span className="text-blue-700 mr-2">•</span>
                {q.question}
              </p>
              <p className="text-gray-700 mt-2 ml-5">
                {answer !== null && answer !== undefined ? answer : "No answer"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LimeSurvey;
