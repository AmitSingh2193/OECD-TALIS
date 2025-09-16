import { fetchOecdData } from '@/state/slices/talisDataSlice';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/state/store';
import { parseOECDClassSizeData } from '@/lib/SimplifyOECDData';
import GroupedBarChart from '@/components/charts/D3BarChart';

interface DataItem {
  country: string;
  institutionType: string;
  educationLevel: string;
  value: number;
}

const TalisData = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { data, loading, error } = useSelector((state: RootState) => state.talisData);
    
    // Convert parsed data to match DataItem type
    const getChartData = (): DataItem[] => {
      if (!data) return [];
      
      const parsedData = parseOECDClassSizeData(data);
      return parsedData.map(item => ({
        country: String(item.country),
        institutionType: String(item.institutionType),
        educationLevel: String(item.educationLevel),
        value: item.value || 0, // Provide a default value if null/undefined
      }));
    };
    
    useEffect(() => {
        const loadData = async () => {
            try {
                await dispatch(fetchOecdData());
            } catch (err) {
                console.error('Failed to load data:', err);
            }
        };

        loadData();
    }, [dispatch]);

    const chartData = getChartData();
    console.log(chartData, "Formatted chart data");

    if (loading) return <div className="p-4">Loading TALIS data...</div>;
    if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

    return (
        <div className="p-4 text-center">
            <h1 className="text-2xl font-bold mb-4">TALIS Data</h1>
            <div className='text-center mx-auto px-auto'>
                <GroupedBarChart data={chartData}/>
            </div>
        </div>
    );
};

export default TalisData;
