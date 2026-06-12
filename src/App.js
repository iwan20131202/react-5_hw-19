import { useState, useEffect, useMemo, useCallback } from "react";
import api from "./services/api.js";

import { Searchbar } from "./components/Searchbar/Searchbar.jsx";
import { ImageGallery } from "./components/ImageGallery/ImageGallery.jsx";
import { Button } from "./components/Button/Button.jsx";
import { Loader } from "./components/Loader/Loader.jsx";
import { Modal } from "./components/Modal/Modal.jsx";

import { Wrapper, ErrorText, EmptyText } from "./App.styled.js";

function App() {
  const [images, setImages] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isVisibleLoadMore, setIsVisibleLoadMore] = useState(false);

  useEffect(() => {
    if (!query) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await api.fetchImages(query, page);
        const newImages = Array.isArray(response) ? response : response.hits;

        setImages((prev) => (page === 1 ? newImages : [...prev, ...newImages]));
        setIsVisibleLoadMore(newImages.length >= 12);
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [query, page]);

  const handleSearch = useCallback((newQuery) => {
    setQuery(newQuery);
    setImages([]);
    setPage(1);
    setIsVisibleLoadMore(false);
  }, []);

  const handleLoadMore = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  const openModal = useCallback((image) => {
    setSelectedImage(image);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const isEmpty = useMemo(() => {
    return !isLoading && images.length === 0 && query;
  }, [isLoading, images, query]);

  return (
    <Wrapper>
      <Searchbar onSubmit={handleSearch} />

      {error && <ErrorText>Error: {error.message}</ErrorText>}

      {isEmpty && <EmptyText>No found results!</EmptyText>}

      {images.length > 0 && (
        <ImageGallery images={images} onImageClick={openModal} />
      )}

      {isLoading && <Loader />}

      {isVisibleLoadMore && !isLoading && <Button onClick={handleLoadMore} />}

      {selectedImage && (
        <Modal
          largeImageURL={selectedImage.largeImageURL}
          tags={selectedImage.tags}
          onClose={closeModal}
        />
      )}
    </Wrapper>
  );
}

export default App;
