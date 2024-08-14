import { useAsyncList } from "react-stately";
import "./App.css";
import { useInView } from "react-intersection-observer";
import { useEffect, useRef } from "react";

const BASE_API_URL = "https://image-search.deno.dev/";
const QUERY = "dogs";

export interface ImageSearchResponse {
  page: number;
  per_page: number;
  photos: Photo[];
  total_results: number;
  next_page: string;
}

export interface Photo {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: Src;
  liked: boolean;
  alt: string;
}

export interface Src {
  original: string;
  large2x: string;
  large: string;
  medium: string;
  small: string;
  portrait: string;
  landscape: string;
  tiny: string;
}

function App() {
  const list = useAsyncList<Photo>({
    async load({ signal, cursor }) {
      const response = await fetch(
        cursor || `${BASE_API_URL}?q=${QUERY}&page=1`,
        {
          signal,
        }
      );
      const json: ImageSearchResponse = await response.json();

      return {
        items: json.photos,
        cursor: `${BASE_API_URL}?q=${QUERY}&page=${json.page + 1}`,
      };
    },
  });

  const { ref, inView } = useInView();

  const listRef = useRef(list);

  useEffect(() => {
    listRef.current = list;
  }, [list]);

  useEffect(() => {
    const currentList = listRef.current;
    if (!currentList) return;
    if (!inView && currentList.isLoading) return;
    currentList.loadMore();
  }, [inView]);

  return (
    <main>
      {list.items.map((item) => (
        <div
          className="item"
          key={item.id}
          style={{
            aspectRatio: `${item.width / item.height}`,
          }}
        >
          <img src={item.src.original} alt={item.alt} />
        </div>
      ))}
      {list.items.length > 0 && <div ref={ref} className="loading" />}
    </main>
  );
}

export default App;
