/**
 * 经纬度查询工具 - 主应用类
 * 实现鼠标实时坐标显示和点击固定坐标功能
 */
class CoordinateQueryApp {
    constructor() {
        this.map = null;
        this.coordConverter = new CoordConverter();
        this.currentMarker = null;
        this.mapLayers = {
            gaode: null,
            osm: null
        };
        this.currentMapType = 'gaode';
        
        this.init();
    }

    /**
     * 初始化应用
     */
    init() {
        this.initMap();
        this.initMapLayers();
        this.initEventListeners();
        this.updateStatus('应用已加载完成');
    }

    /**
     * 初始化地图
     */
    initMap() {
        // 初始化地图，默认显示中国中心位置
        this.map = L.map('map', {
            center: [39.9042, 116.4074], // 北京坐标
            zoom: 10,
            zoomControl: true,
            attributionControl: false
        });

        // 添加缩放控件到右下角
        L.control.zoom({
            position: 'bottomright'
        }).addTo(this.map);
    }

    /**
     * 初始化地图图层
     */
    initMapLayers() {
        // 高德地图图层
        this.mapLayers.gaode = L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
            subdomains: ['1', '2', '3', '4'],
            attribution: '© 高德地图'
        });

        // OpenStreetMap图层
        this.mapLayers.osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        });

        // 默认添加高德地图
        this.mapLayers.gaode.addTo(this.map);
    }

    /**
     * 初始化事件监听器
     */
    initEventListeners() {
        // 地图类型切换
        document.getElementById('mapType').addEventListener('change', (e) => {
            this.switchMapType(e.target.value);
        });

        // 清除标记按钮
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearMarker();
        });



        // 地图鼠标移动事件 - 实时坐标显示
        this.map.on('mousemove', (e) => {
            this.updateRealtimeCoordinates(e.latlng);
        });

        // 地图点击事件 - 固定坐标显示
        this.map.on('click', (e) => {
            this.setFixedCoordinates(e.latlng);
        });

        // 地图鼠标离开事件
        this.map.on('mouseout', () => {
            this.clearRealtimeCoordinates();
        });
    }

    /**
     * 切换地图类型
     */
    switchMapType(mapType) {
        // 移除当前图层
        if (this.mapLayers[this.currentMapType]) {
            this.map.removeLayer(this.mapLayers[this.currentMapType]);
        }

        // 添加新图层
        if (this.mapLayers[mapType]) {
            this.mapLayers[mapType].addTo(this.map);
            this.currentMapType = mapType;
            
            const mapNames = {
                'gaode': '高德地图',
                'osm': 'OpenStreetMap'
            };
            
            this.updateStatus(`已切换到 ${mapNames[mapType]}`);
        }
    }

    /**
     * 更新鼠标停留坐标显示
     */
    updateRealtimeCoordinates(latlng) {
        const lat = latlng.lat;
        const lng = latlng.lng;

        // 根据地图类型进行坐标转换
        let displayLng = lng;
        let displayLat = lat;
        
        if (this.currentMapType === 'gaode') {
            // 高德地图使用GCJ02坐标系，转换为WGS84显示
            const wgs84 = this.coordConverter.gcj02ToWgs84(lng, lat);
            displayLng = wgs84[0];
            displayLat = wgs84[1];
        }
        // OSM地图本身就是WGS84，无需转换

        // 显示经纬度坐标 (Lng, Lat)
        document.getElementById('hover-coords').textContent = 
            `${displayLng.toFixed(6)}, ${displayLat.toFixed(6)}`;

        // 更新状态栏
        this.updateStatus(`鼠标停留坐标: ${displayLng.toFixed(6)}, ${displayLat.toFixed(6)}`);
    }

    /**
     * 清除鼠标停留坐标显示
     */
    clearRealtimeCoordinates() {
        document.getElementById('hover-coords').textContent = '移动鼠标获取坐标';
        this.updateStatus('移动鼠标查看坐标，点击地图固定坐标');
    }

    /**
     * 设置点击坐标显示
     */
    setFixedCoordinates(latlng) {
        const lat = latlng.lat;
        const lng = latlng.lng;

        // 清除之前的标记
        this.clearMarker();

        // 添加图钉标记
        this.currentMarker = L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'pin-marker',
                html: '<div style="color: #ff4757; font-size: 24px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">📍</div>',
                iconSize: [24, 24],
                iconAnchor: [12, 24]
            })
        }).addTo(this.map);

        // 根据地图类型进行坐标转换
        let displayLng = lng;
        let displayLat = lat;
        
        if (this.currentMapType === 'gaode') {
            // 高德地图使用GCJ02坐标系，转换为WGS84显示
            const wgs84 = this.coordConverter.gcj02ToWgs84(lng, lat);
            displayLng = wgs84[0];
            displayLat = wgs84[1];
        }
        // OSM地图本身就是WGS84，无需转换

        // 显示点击坐标 (Lng, Lat)
        document.getElementById('click-coords').textContent = 
            `${displayLng.toFixed(6)}, ${displayLat.toFixed(6)}`;

        // 添加弹出框显示坐标信息
        const popupContent = `
            <div style="font-family: monospace; font-size: 12px; line-height: 1.4;">
                <strong>坐标信息</strong><br>
                <strong>经度:</strong> ${displayLng.toFixed(6)}<br>
                <strong>纬度:</strong> ${displayLat.toFixed(6)}
            </div>
        `;
        
        this.currentMarker.bindPopup(popupContent).openPopup();

        // 更新状态栏
        this.updateStatus(`已固定坐标: ${displayLng.toFixed(6)}, ${displayLat.toFixed(6)}`);
    }

    /**
     * 清除标记
     */
    clearMarker() {
        if (this.currentMarker) {
            this.map.removeLayer(this.currentMarker);
            this.currentMarker = null;
        }

        // 清除点击坐标显示
        document.getElementById('click-coords').textContent = '点击地图获取坐标';

        this.updateStatus('已清除标记点');
    }

    /**
     * 更新状态栏
     */
    updateStatus(message) {
        document.getElementById('statusText').textContent = message;
    }


}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new CoordinateQueryApp();
});