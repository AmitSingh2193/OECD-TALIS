import React, { useState, useEffect } from "react";
import { get_req, post_req } from "@/network/network";
import { decodeBase64 } from "@/lib/encoding";
import { SurveyData } from "@/lib/constants/SimplifyResponse";

interface SessionKeyResponse {
  result: string; // or whatever the response structure is
  id: number;
}

interface SurveyResponse {
  result: string;
  id: number;
}

interface LimeSurveyError {
  error: string;
  code: number;
}

interface Question {
  id: string | number;
  question: string;
  title: string;
  type?: string;
  mandatory?: string;
  question_order?: number;
  [key: string]: any; // for any additional properties
}

interface SurveyAnswerResponse {
    id: string;
    [key: string]: string | number | null | undefined;
  }

const LimeSurvey = () => {
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
//   const [surveyResponse, setSurveyResponse] = useState<SimplifiedSurveyResponse[] | null>(null);
  const [surveyResponse, setSurveyResponse] = useState<SurveyAnswerResponse  | null>(null);
  const [surveyQuestions, setSurveyQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const proxyUrl = "https://cors-anywhere.herokuapp.com/";
  const targetUrl = "https://survey.oecd.org/index.php?r=admin/remotecontrol";
  const username = import.meta.env.VITE_LIMESURVEY_USER;
  const remoteToken = import.meta.env.VITE_LIMESURVEY_TOKEN;
  const surveyId: String = "495561";
  const country = "India"
//   const rid = 18
  const rid = localStorage.getItem("rid")

  const fetchSessionKey = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await post_req<SessionKeyResponse>(
        proxyUrl + targetUrl,
        {
          method: "get_session_key",
          params: [username, remoteToken],
          id: 1,
        },
        {
          "Content-Type": "application/json",
        }
      );

      if (response.data && response.data.result) {
        setSessionKey(response.data.result);
      } else {
        setError("Failed to get session key");
      }
    } catch (err) {
      console.error("Error fetching session key:", err);
      setError("An error occurred while fetching the session key");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionKey();
  }, []);

  const fetchSurveyResponses = async () => {
    try {
      const response = await post_req<SurveyResponse>(
        proxyUrl + targetUrl,
        {
          method: "export_responses",
          params: [sessionKey, surveyId, "json"],
          id: 1,
        },
        {
          "Content-Type": "application/json",
        }
      );

      if (response.data && response.data.result) {
        const decodedData = decodeBase64(response.data.result);
        const parsedData = JSON.parse(decodedData);
        const answers = parsedData.responses.filter((item:any)=>item.id==rid)
        setSurveyResponse(answers[0] || null);
      } else {
        setError("Failed to get survey response");
      }
    } catch (error) {
      console.error("Error fetching survey response:", error);
      setError("An error occurred while fetching the survey response");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSurveyQuestions = async () => {
    try {
      const response = await post_req<SurveyResponse>(
        proxyUrl + targetUrl,
        {
          method: "list_questions",
          params: [sessionKey, surveyId],
          id: 1,
        },
        {
          "Content-Type": "application/json",
        }
      );

      if (response.data && response.data.result) {
        // Transform the response into the Question type
        const questions = (Array.isArray(response.data.result) 
          ? response.data.result 
          : [response.data.result]
        ).map(item => ({
          id: item.qid || item.id || '',
          question: item.question || '',
          title: item.title || item.name || '',
          type: item.type,
          mandatory: item.mandatory,
          question_order: item.question_order,
          ...item // Include all other properties
        }));

        setSurveyQuestions(questions);
      } else {
        setError("Failed to get survey questions");
      }
    } catch (error) {
      console.error("Error fetching survey questions:", error);
      setError("An error occurred while fetching the survey questions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveyResponses();
    fetchSurveyQuestions();
  }, [sessionKey]);

//   console.log(sessionKey, "sessionKey");
  console.log('Survey Response:', surveyResponse);
  console.log('Survey Questions:', surveyQuestions);

  return (
    <div>
    {surveyQuestions?.map((q: Question, index: number) => {
      const answer = surveyResponse ? surveyResponse[q.title] : null;

      return (
        <div key={q.id} className="p-3 border rounded-lg shadow-sm mb-2">
          <p className="font-semibold">
            Question {index + 1}: {q.question}
          </p>
          <p className="text-gray-700">
            Answer: {answer !== null && answer !== undefined ? answer : "No answer"}
          </p>
        </div>
      );
    })}
  </div>
  );
};

export default LimeSurvey;
