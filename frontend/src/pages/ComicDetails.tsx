import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, BookOpen, Share2, Download, Heart, Eye, Clock, Grid, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';

const comicsList = [
  {
    id: 1,
    title: "SuperPutin: Origins",
    cover: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&h=1200&q=80",
    author: "Alex Smith",
    episodes: 12,
    rating: 4.8,
    category: "Action",
    status: "Ongoing",
    views: "125K",
    description: "Follow the extraordinary journey of SuperPutin as he discovers his powers and learns to use them for the greater good. This action-packed series combines superhero elements with geopolitical intrigue.",
    chapters: [
      { 
        number: 1, 
        title: "The Awakening", 
        cover: "https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=800&h=400&q=80",
        views: "45K",
        lastUpdated: "2 days ago",
        pages: [
          "https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=1200&h=800&q=80",
          "https://images.unsplash.com/photo-1594453901411-de9e39861cad?w=1200&h=800&q=80",
          "https://images.unsplash.com/photo-1624559888077-1a829f93c9cf?w=1200&h=800&q=80"
        ]
      },
      { 
        number: 2, 
        title: "Power Rising", 
        cover: "https://images.unsplash.com/photo-1594453901411-de9e39861cad?w=800&h=400&q=80",
        views: "38K",
        lastUpdated: "1 week ago",
        pages: [
          "https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=1200&h=800&q=80",
          "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?w=1200&h=800&q=80"
        ]
      },
      { 
        number: 3, 
        title: "The First Test", 
        cover: "https://images.unsplash.com/photo-1624559888077-1a829f93c9cf?w=800&h=400&q=80",
        views: "32K",
        lastUpdated: "2 weeks ago",
        pages: [
          "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=1200&h=800&q=80",
          "https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?w=1200&h=800&q=80",
          "https://images.unsplash.com/photo-1604537466158-719b1972feb8?w=1200&h=800&q=80"
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Crypto Warriors",
    cover: "https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=800&h=1200&q=80",
    author: "Maria Johnson",
    episodes: 8,
    rating: 4.6,
    category: "Sci-Fi",
    status: "Ongoing",
    views: "98K",
    description: "In a world where cryptocurrency rules the economy, a group of digital warriors fights to protect the blockchain from cyber threats. A thrilling sci-fi adventure in the crypto universe.",
    chapters: [
      { 
        number: 1, 
        title: "Digital Dawn", 
        cover: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&q=80",
        views: "28K",
        lastUpdated: "3 days ago",
        pages: [
          "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=800&q=80",
          "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=1200&h=800&q=80"
        ]
      },
      { 
        number: 2, 
        title: "The Blockchain Breach", 
        cover: "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&h=400&q=80",
        views: "22K",
        lastUpdated: "1 week ago",
        pages: [
          "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=1200&h=800&q=80",
          "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=800&q=80"
        ]
      }
    ]
  },
  {
    id: 3,
    title: "Digital Legends",
    cover: "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?w=800&h=1200&q=80",
    author: "John Doe",
    episodes: 15,
    rating: 4.9,
    category: "Fantasy",
    status: "Completed",
    views: "203K",
    description: "Dive into a world where digital heroes become legends. Follow the epic journey of cyber warriors as they navigate through virtual realms and face unprecedented challenges in this groundbreaking fantasy series.",
    chapters: [
      {
        number: 1,
        title: "The Digital Awakening",
        cover: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&h=400&q=80",
        views: "89K",
        lastUpdated: "1 day ago",
        pages: [
          "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=1200&h=800&q=80",
          "https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?w=1200&h=800&q=80",
          "https://images.unsplash.com/photo-1604537466158-719b1972feb8?w=1200&h=800&q=80"
        ]
      },
      {
        number: 2,
        title: "Virtual Horizons",
        cover: "https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?w=800&h=400&q=80",
        views: "76K",
        lastUpdated: "3 days ago",
        pages: [
          "https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=1200&h=800&q=80",
          "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?w=1200&h=800&q=80",
          "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=1200&h=800&q=80"
        ]
      },
      {
        number: 3,
        title: "Code Warriors",
        cover: "https://images.unsplash.com/photo-1604537466158-719b1972feb8?w=800&h=400&q=80",
        views: "65K",
        lastUpdated: "1 week ago",
        pages: [
          "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=800&q=80",
          "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=1200&h=800&q=80",
          "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=1200&h=800&q=80"
        ]
      }
    ]
  }
];

export function ComicDetails() {
  const { id } = useParams();
  const comic = comicsList.find(c => c.id === Number(id));
  const [isLiked, setIsLiked] = React.useState(false);
  const [selectedChapter, setSelectedChapter] = React.useState<number | null>(null);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [isGalleryView, setIsGalleryView] = React.useState(false);

  if (!comic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Comic not found</h1>
          <Link to="/comics" className="text-primary hover:underline">
            Return to Comics Gallery
          </Link>
        </div>
      </div>
    );
  }

  const chapter = selectedChapter !== null ? comic.chapters[selectedChapter] : null;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/comics"
          className="flex items-center gap-2 text-text/70 hover:text-primary transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Gallery
        </Link>
      </div>

      {selectedChapter === null ? (
        <>
          {/* Hero Section */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative group">
              <img
                src={comic.cover}
                alt={comic.title}
                className="w-full rounded-xl object-cover aspect-[3/4]"
              />
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button className="bg-white/90 backdrop-blur-sm p-2 rounded-lg hover:bg-white transition-colors">
                  <Share2 size={20} />
                </button>
                <button className="bg-white/90 backdrop-blur-sm p-2 rounded-lg hover:bg-white transition-colors">
                  <Download size={20} />
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h1 className="font-poppins font-bold text-4xl mb-2">{comic.title}</h1>
                <p className="text-text/70">by {comic.author}</p>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1">
                  <Star size={20} className="text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">{comic.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen size={20} className="text-text/70" />
                  <span>{comic.episodes} Episodes</span>
                </div>
              </div>

              <p className="text-text/80 leading-relaxed">{comic.description}</p>

              <div className="flex gap-4">
                <button 
                  onClick={() => setSelectedChapter(0)}
                  className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Start Reading
                </button>
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`p-3 rounded-lg border transition-colors ${
                    isLiked
                      ? "bg-red-50 border-red-200"
                      : "border-text/10 hover:bg-text/5"
                  }`}
                >
                  <Heart
                    size={24}
                    className={isLiked ? "text-red-500 fill-red-500" : ""}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Chapters */}
          <div className="space-y-6">
            <h2 className="font-poppins font-semibold text-2xl">Chapters</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {comic.chapters.map((chapter, index) => (
                <div
                  key={chapter.number}
                  className="bg-background border border-text/10 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-video">
                    <img
                      src={chapter.cover}
                      alt={chapter.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <div className="p-4 text-white">
                        <div className="font-medium">Chapter {chapter.number}</div>
                        <div className="text-white/90">{chapter.title}</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-sm text-text/70">
                      <div className="flex items-center gap-1">
                        <Eye size={16} />
                        <span>{chapter.views} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>{chapter.lastUpdated}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedChapter(index)}
                      className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Read Chapter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-poppins font-semibold text-2xl">
                Chapter {chapter?.number}: {chapter?.title}
              </h2>
              <p className="text-text/70">
                Page {currentPage + 1} of {chapter?.pages.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsGalleryView(!isGalleryView)}
                className="flex items-center gap-2 text-text/70 hover:text-primary transition-colors"
              >
                {isGalleryView ? <Maximize2 size={20} /> : <Grid size={20} />}
                {isGalleryView ? 'Reader View' : 'Gallery View'}
              </button>
              <button
                onClick={() => {
                  setSelectedChapter(null);
                  setCurrentPage(0);
                  setIsGalleryView(false);
                }}
                className="text-primary hover:underline"
              >
                Back to Chapters
              </button>
            </div>
          </div>

          {isGalleryView ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {chapter?.pages.map((page, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer"
                  onClick={() => {
                    setCurrentPage(index);
                    setIsGalleryView(false);
                  }}
                >
                  <img
                    src={page}
                    alt={`Page ${index + 1}`}
                    className="w-full aspect-[3/4] object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-medium">Page {index + 1}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative">
              <img
                src={chapter?.pages[currentPage]}
                alt={`Page ${currentPage + 1}`}
                className="w-full rounded-lg shadow-lg"
              />
              
              <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-background/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-text/10">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="flex items-center gap-2 text-text/70 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={20} />
                  Previous
                </button>
                <div className="font-medium">
                  {currentPage + 1} / {chapter?.pages.length}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(chapter?.pages.length - 1 || 0, prev + 1))}
                  disabled={currentPage === (chapter?.pages.length || 0) - 1}
                  className="flex items-center gap-2 text-text/70 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}