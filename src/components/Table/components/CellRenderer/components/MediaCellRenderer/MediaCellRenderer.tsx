import { Column } from '@tanstack/react-table';
import { Base64 } from 'js-base64';
import React, { useState, useEffect } from 'react';
import mime from 'mime';
import { BASE64_IMAGE_HEADER_REGEX, IMAGE_TYPES_SYMBOLS, TEST_IDS } from '@/constants';
import { Modal, Button } from '@grafana/ui';
import { AppEvents } from '@grafana/data';
import { getAppEvents } from '@grafana/runtime';

interface Props {
  value: string;
  column: Column<unknown>;
  cacheEnabled?: boolean;
  cacheExpiry?: number;
  fallbackSrc?: string;
}

const CACHE_PREFIX = 'img_cache_';

const appEvents = getAppEvents();
export const MediaCellRenderer: React.FC<Props> = ({
  value,
  column,
  cacheEnabled = false,
  cacheExpiry = 5 * 60 * 1000,
  fallbackSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
}) => {
  const [src, setSrc] = useState<string>(fallbackSrc);
  const [error, setError] = useState(false);
  const [mediaInfo, setMediaInfo] = useState<{ type: 'image' | 'video' | null; mimeType?: string }>({ type: null });
  const [previewIsPresent,setPreviewIsPresent] = useState(false)
  const [previewOverlayIsPresent,setPreviewOverlayIsPresent] = useState(false)

  const getMediaInfo = (value: string): { type: 'image' | 'video' | null; mimeType?: string } => {
    // @ts-ignore
    if (value.startsWith('data:')) {
      const mimeMatch = value.match(/^data:(.+?);/);
      if (mimeMatch) {
        const mimeType = mimeMatch[1];
        if (mimeType.startsWith('image/')) {
          return { type: 'image', mimeType };
        } else if (mimeType.startsWith('video/')) {
          return { type: 'video', mimeType };
        }
      }
      return { type: null };
    }

    if (value.startsWith('http')) {
      try {
        const url = new URL(value);
        const extension = url.pathname.split('.').pop()?.toLowerCase();
        if (extension) {
          const mimeType = mime.getType(extension); // Changed here
          if (mimeType?.startsWith('video/')) {
            return { type: 'video', mimeType };
          } else if (mimeType?.startsWith('image/')) {
            return { type: 'image', mimeType };
          }
        }
      } catch {
        return { type: null };
      }
    }

    return { type: null };
  };

  const getCacheKey = (input: string) => {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = (hash << 5) - hash + input.charCodeAt(i);
      hash |= 0;
    }
    return `${CACHE_PREFIX}${hash}`;
  };

  const openPreview = (props)=>{
    setPreviewOverlayIsPresent(false)
    setPreviewIsPresent(!previewIsPresent)
  }

  async function downloadMedia() {
    
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const fileName = decodeURIComponent(new URL(src).pathname.split('/').pop())
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();      
    } catch (error) {
      console.error(error)
      appEvents.publish({
        type: AppEvents.alertError.name,
        payload: [`File could not be download. Save the file from the new tab it was opened in`]
      });      
      setTimeout(() => {
        window.open(src,"_blank")
      }, 3000);
    }

  }


  useEffect(() => {
    setSrc(fallbackSrc)
    const processMedia = async () => {
      try {
        let processedValue = value;
        let cacheKey = '';

        if (value && Base64.isValid(value)) {
          const mediaMatch = value.match(BASE64_IMAGE_HEADER_REGEX);
          if (!mediaMatch) {
            const type = IMAGE_TYPES_SYMBOLS[value.charAt(0)];
            processedValue = type ? `data:${type};base64,${value}` : `data:;base64,${value}`;
          }
        }

        if (cacheEnabled) {
          cacheKey = getCacheKey(processedValue);
          const cached = localStorage.getItem(cacheKey);
          const cacheData = cached ? JSON.parse(cached) : null;

          if (cacheData && Date.now() - cacheData.timestamp < cacheExpiry) {
            console.log("a")
            setSrc(cacheData.value);
            return;
          }
        }


        setSrc(processedValue);

        if (cacheEnabled) {
          localStorage.setItem(cacheKey, JSON.stringify({
            value: processedValue,
            timestamp: Date.now()
          }));
        }
      } catch (error) {
        console.error('Media processing error:', error);
        setError(true);
      }
    };
    setTimeout(() => {
      
      processMedia();
    }, 100);
  }, [value, cacheEnabled, cacheExpiry]);

  useEffect(() => {
    setError(false)
    setMediaInfo(getMediaInfo(src));
  }, [src]);

  const mediaStyle: any = {
    maxWidth: '100%',
    minWidth: column.columnDef.minSize,
    width: 'auto',
    imageRendering: mediaInfo.type === 'image' ? column.columnDef.meta?.scale : undefined,
    objectFit: mediaInfo.type === 'video' ? 'cover' : undefined,
  };

  const previewMediaStyle: any ={

    maxWidth:"100%",
    height:"475px"
  }

  if (error) {
    return (
      <img
        src={fallbackSrc}
        alt=""
        style={mediaStyle}
        {...TEST_IDS.mediaCellRenderer.root.apply()}
      />
    );
  }

  
  return <div
    style={{
      cursor:"pointer",
      position:"relative"
    }}
   onClick={openPreview}
   onPointerEnter={()=>setPreviewOverlayIsPresent(true)}
   onPointerLeave={()=>setPreviewOverlayIsPresent(false)}
  > 
    {previewOverlayIsPresent &&<div
      style={{
        position:"absolute",
        inset:0,
        width:"100%",
        height:"100%",
        background:"rgba(0,0,0,0.5)",
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        
      }}
    >
      <p>Preview</p>
    </div>}
    <Modal 
    title="Preview" 
    isOpen={previewIsPresent }>
      <div
        style={{
          display:"flex",
          justifyContent:"center",

        }}
      >

          {
            mediaInfo.type === 'video' ? (
              <video
                loop
                autoPlay
                muted
                playsInline
                style={previewMediaStyle}
                onError={(error) => {
                  console.error(error,src)
                  setError(true)
                }}
                {...TEST_IDS.mediaCellRenderer.root.apply()}
              >
                <source src={src} type={mediaInfo.mimeType} />
              </video>
            ) : (
              <img
                src={src}
                alt=""
                style={{
                  ...previewMediaStyle,
                  aspectRatio:"auto"
                }}
                onError={(error) => {
                  console.error(error,src)
                  setError(true)
                }}
                {...TEST_IDS.mediaCellRenderer.root.apply()}
              />
            )
          }      
      </div>
      <Modal.ButtonRow>
        <Button onClick={downloadMedia}>Download</Button>
      </Modal.ButtonRow>
    </Modal>    
    {
      mediaInfo.type === 'video' ? (
        <video
          loop
          autoPlay
          muted
          playsInline
          style={mediaStyle}
          onError={(error) => {
            console.error(error,src)
            setError(true)
          }}
          {...TEST_IDS.mediaCellRenderer.root.apply()}
        >
          <source src={src} type={mediaInfo.mimeType} />
        </video>
      ) : (
        <img
          src={src}
          alt=""
          style={mediaStyle}
          onError={(error) => {
            console.error(error,src)
            setError(true)
          }}
          {...TEST_IDS.mediaCellRenderer.root.apply()}
        />
      )
    }
  </div>  
};