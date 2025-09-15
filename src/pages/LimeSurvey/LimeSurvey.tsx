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
  // const country = "India"
  //   const rid = 18
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

    // Cleanup function to clear session key when component unmounts
    // return () => {
    //   dispatch(clearSessionKey());
    // };
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

  // Show loading state when session, responses or questions are being fetched
  if (isSessionLoading || isLoadingResponses || isLoadingQuestions) {
    return <div>Loading...</div>;
  }

  // Show error if session key, responses or questions couldn't be fetched
  if (sessionError || responsesError || questionsError) {
    return (
      <div className="text-red-500">
        Error: {sessionError || responsesError || questionsError}
      </div>
    );
  }

  //   console.log(sessionKey, "sessionKey");
  console.log("Survey Response:", surveyResponse);
  console.log("Survey Questions:", surveyQuestions);

  return (
    <div>
      <div className="py-4">
        <h1>
          <b>Your Submitted Responses</b>
        </h1>
      </div>
      {surveyQuestions?.map((q: Question, index: number) => {
        const answer = surveyResponse ? surveyResponse[q.title] : null;

        return (
          <div key={q.id}>
            <div className="p-3 border rounded-lg shadow-sm mb-2 bg-white transition-transform duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-grey-400">
              <p className="font-semibold">
                Question {index + 1}: {q.question}
              </p>
              <p className="text-gray-700">
                Answer:{" "}
                {answer !== null && answer !== undefined ? answer : "No answer"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LimeSurvey;
