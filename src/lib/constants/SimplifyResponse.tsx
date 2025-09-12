export interface SurveyResponse {
    id: string;
    [key: string]: string | number | null | undefined;
  }
  
  export interface SurveyData {
    responses: SurveyResponse[];
  }
  
  export interface SimplifiedSurveyResponse {
    id: string;
    [questionCode: string]: string | number; // dynamic question codes
  }
  
  export const SimplifySurveyResponses = (data: SurveyData | null): SimplifiedSurveyResponse[] => {
    if (!data || !data.responses) return [];
  
    return data.responses.map((response: SurveyResponse): SimplifiedSurveyResponse => {
      const { id, ...rest } = response;
  
      const simplified: SimplifiedSurveyResponse = { id };
  
      Object.entries(rest)
        .filter(([_, value]) => value !== null && value !== "") // remove empty values
        .forEach(([questionCode, answer]) => {
          simplified[questionCode] = answer as string | number;
        });
  
      return simplified;
    });
  };
  