import { useState, useEffect } from 'react'
import { useRecoilValue, useRecoilState } from 'recoil'
import styled from 'styled-components'

import { SearchInput, SearchResult, MapComponent } from 'components'
import { searchIpState, searchResState, mapObjState, loadTargetState, isLoadedState } from 'recoil/atom/map'
import * as Constants from 'constants/mapContants'
import apiKey from 'key.json'

const MapContainer = () => {

  const [searchPage, setSearchPage] = useState(1)
  const searchIp = useRecoilValue(searchIpState)
  const [mapObj] = useRecoilState(mapObjState)
  const [loadTarget, setLoadTarget] = useRecoilState(loadTargetState)
  const [isLoaded, setIsLoaded] = useRecoilState(isLoadedState)
  const [searchRes, setSearchRes] = useRecoilState(searchResState)

  /* api */
  const api = {
    key: apiKey.API_KEY_KAKAO_MAP_LOCAL,
    url: 'http://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=',
    services: '&libraries=services'
  }
  const { key, url, services } = api

  const searchOption = {
    page: 1,    
    x: Constants.SEARCH_OPT_X,
    y: Constants.SEARCH_OPT_Y,
    category_group_code: Constants.SEARCH_OPT_CATEGORY_FOOD   
  }

  /* global kakao */
  // 최초 렌더링 시 스크립트에 api 정보 추가
  useEffect(() => {
    const script = document.createElement('script')
    script.onload = () => kakao.maps.load(initMap)
    script.src = url + key + services
    document.head.appendChild(script)
  }, [])
  
  const initMap = () => {
    const mapOptions = {
      center: new kakao.maps.LatLng(Constants.POSITION_LAT_CDNT, Constants.POSITION_LNG_CDNT),
      level: 8
    }
    const container = document.getElementById('map')
    new kakao.maps.Map(container, mapOptions)
  }

  const keywordSearch = async (firstSearch) => {
    setIsLoaded(true)

    const places = new kakao.maps.services.Places()
    if (firstSearch) {
      /* init */
      searchOption.page = 1
      setSearchRes([])
      await places.keywordSearch(searchIp, keywordSearchCB, searchOption)
    } else {
      // await places.keywordSearch(searchIp, keywordSearchAgainCB, searchOption)
    }
    searchOption.page += 1

    setIsLoaded(false)
  }

  const keywordSearchCB = async (res, status) => {
    const resStatus = kakao.maps.services.Status
    if (status === resStatus.OK) {
      // const mapOptions = {
      //   center: new kakao.maps.LatLng(Constants.POSITION_LAT_CDNT, Constants.POSITION_LNG_CDNT),
      //   level: 8
      // }
      // const container = document.getElementById('map')
      // new kakao.maps.Map(container, mapOptions)

      setSearchRes(res)
    } else if (status === resStatus.ZERO_RESULT) {
      alert('검색 결과가 없습니다!')
    } else {
      alert('서버 응답에 문제가 있습니다!')
    }
  }

  // const keywordSearchAgainCB = async (res, status) => {
  //   const resStatus = kakao.maps.services.Status
  //   if (status === resStatus.OK) {
  //     setSearchRes(searchRes => searchRes.concat(res))
  //   }
  // }

  // /* Infinite scroll */
  // useEffect(() => {
  //   let observer;

  //   if (loadTarget) {
  //     observer = new IntersectionObserver(onIntersect, {
  //       threshold: 0.4,
  //     })
  //     observer.observe(loadTarget)
  //   }
  //   return () => observer && observer.disconnect();
  // }, [loadTarget, searchIp])

  // const onIntersect = async ([entry], observer) => {
  //   if (entry.isIntersecting) {
  //     observer.unobserve(entry.target);
  //     await keywordSearch(false);
  //     observer.observe(entry.target);
  //   }
  // }

  return (
    <Wrapper>
      <Container>
        <SearchInput
          onSearch={() => keywordSearch(true)}
        />
        <SearchResult searchRes={searchRes}/>
      </Container>
      <MapComponent />
    </Wrapper>
  )
}

const Wrapper = styled.div`
`

const Container = styled.div`
  background: white;
  position: absolute;
  z-index: 20;
  width: 390px;
  height: 100vh;
  box-shadow: 0 0 5px 0 rgb(0 0 0 / 20%), 5px 0 15px 0 rgb(0 0 0 / 10%);
`

export default MapContainer