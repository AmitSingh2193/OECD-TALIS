import { fetchOecdData } from '@/state/slices/talisDataSlice';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/state/store';

const TalisData = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { data, loading, error } = useSelector((state: RootState) => state.talisData);
    
    useEffect(() => {
        const loadData = async () => {
            try {
                await dispatch(fetchOecdData()).unwrap();
            } catch (err) {
                console.error('Failed to load data:', err);
            }
        };

        loadData();
    }, []);

    console.log(data,"324234");

    if (loading) return <div className="p-4">Loading TALIS data...</div>;
    if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">TALIS Data</h1>
        </div>
    );
};

export default TalisData;
