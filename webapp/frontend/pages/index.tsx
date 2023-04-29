import { Select } from 'antd';
import { useEffect, useState } from 'react';

export default function Home() {
  const [titleList, setTitleList] = useState<string[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<string>('');
  const [recommendationList, setRecommendationList] = useState<
    {
      title: string;
      category: string;
      brand: string;
      main_cat: string;
      imageURLHighRes: string;
    }[]
  >([]);

  useEffect(() => {
    const getTitleList = async () => {
      const response = await fetch('http://127.0.0.1:5000/titles');
      const result = await response.json();
      setTitleList(result.data);
    };
    getTitleList();
  }, []);

  const onChange = (value: string) => {
    setSelectedTitle(value);
  };

  const onSearch = (value: string) => {
    console.log('search:', value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const response = await fetch('http://127.0.0.1:5000/content-based', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: selectedTitle }),
    });

    const result = await response.json();
    setRecommendationList(result);
  };

  return (
    <div>
      <div className="p-4 max-w-3xl m-auto">
        <h1 className="text-2xl font-semibold text-slate-800 mt-3 mb-5">
          Product Recommender System
        </h1>
        <div>
          <form onSubmit={handleSubmit}>
            <div className="grid mb-6">
              <div>
                <label
                  htmlFor="variety-code"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Product Title
                </label>

                <Select
                  showSearch
                  size="large"
                  className="min-w-full max-w-[736px]"
                  placeholder="Select a product"
                  optionFilterProp="children"
                  onChange={onChange}
                  onSearch={onSearch}
                >
                  {titleList.map((item) => (
                    <Select.Option key={item} value={item}>
                      {item}
                    </Select.Option>
                  ))}
                </Select>

                <span className="block mt-2 text-sm text-slate-500 dark:text-white">
                  Assuming selecting a product here is equivalent to a user
                  viewing the product page.
                </span>
              </div>
            </div>
            <button
              type="submit"
              className="text-white rounded-lg bg-primary focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:focus:ring-blue-800"
            >
              Get Recommendations
            </button>
          </form>
        </div>
      </div>

      <div className="antialiased bg-slate-300 text-gray-900 mt-6">
        <div className="container mx-auto max-w-3xl p-4">
          <div className="flex flex-wrap -mx-4">
            {recommendationList.length > 0 ? (
              recommendationList.map((item, i) => (
                <div key={item.title + i} className="w-full sm:w-1/2 md:w-1/2 p-4">
                  <a
                    href=""
                    className="c-card block bg-white shadow-md hover:shadow-xl rounded-lg overflow-hidden"
                  >
                    <div className="relative pb-48 overflow-hidden">
                      <img
                        className="absolute inset-0 h-full w-full object-cover"
                        src={item.imageURLHighRes || '/img/placeholder.png'}
                        alt="Product Image"
                      />
                    </div>
                    <div className="p-4">
                      <span className="inline-block px-3 py-2 leading-none bg-orange-200 text-orange-800 rounded-full font-semibold tracking-wide text-sm">
                        Brand: {item.brand}
                      </span>
                      <h2 className="mt-3 mb-1 font-bold">{item.title}</h2>
                    </div>
                    <div className="p-4 border-t border-b text-sm text-gray-700">
                      <span>
                        <b>Main Category:</b> {item.main_cat}
                      </span>
                    </div>
                    <div className="p-4 flex items-center text-sm text-gray-700">
                      <span>
                        <b>Category Tags:</b> {item.category}
                      </span>
                    </div>
                  </a>
                </div>
              ))
            ) : (
              <div key="empty" className="w-full sm:w-1/2 md:w-1/2 p-4">
                Results will be shown here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
