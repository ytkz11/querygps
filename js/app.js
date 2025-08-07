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
        this.coordinateFormat = 'decimal'; // 'decimal' 或 'dms' (度分秒)
        this.isCoordinateReversed = false; // 是否反选坐标（纬度在前）
        
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
        document.getElementById('clearMarker').addEventListener('click', () => {
            this.clearMarker();
        });

        // 格式切换按钮
        document.getElementById('formatToggle').addEventListener('click', () => {
            this.toggleCoordinateFormat();
        });

        // 坐标反选按钮
        document.getElementById('coordReverse').addEventListener('click', () => {
            this.toggleCoordinateReverse();
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

        // 使用新的格式化方法显示坐标
        this.updateCoordinateDisplay('hover', displayLng, displayLat);

        // 更新状态栏
        this.updateStatus(`鼠标停留坐标: ${displayLng.toFixed(6)}, ${displayLat.toFixed(6)}`);
    }

    /**
     * 清除鼠标停留坐标显示
     */
    clearRealtimeCoordinates() {
        document.getElementById('hover-lng').textContent = '--';
        document.getElementById('hover-lat').textContent = '--';
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

        // 使用新的格式化方法显示坐标
        this.updateCoordinateDisplay('click', displayLng, displayLat);

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
        document.getElementById('click-lng').textContent = '--';
        document.getElementById('click-lat').textContent = '--';

        this.updateStatus('已清除标记点');
    }

    /**
     * 更新状态栏
     */
    updateStatus(message) {
        document.getElementById('statusText').textContent = message;
    }

    /**
     * 将小数点坐标转换为度分秒格式
     */
    decimalToDMS(decimal, isLongitude = true) {
        const abs = Math.abs(decimal);
        const degrees = Math.floor(abs);
        const minutes = Math.floor((abs - degrees) * 60);
        const seconds = ((abs - degrees) * 60 - minutes) * 60;
        
        const direction = isLongitude 
            ? (decimal >= 0 ? 'E' : 'W')
            : (decimal >= 0 ? 'N' : 'S');
        
        return `${degrees}°${minutes}'${seconds.toFixed(2)}"${direction}`;
    }

    /**
     * 格式化坐标显示
     */
    formatCoordinate(lng, lat) {
        if (this.coordinateFormat === 'dms') {
            const lngDMS = this.decimalToDMS(lng, true);
            const latDMS = this.decimalToDMS(lat, false);
            
            if (this.isCoordinateReversed) {
                return { first: latDMS, second: lngDMS };
            } else {
                return { first: lngDMS, second: latDMS };
            }
        } else {
            const lngDecimal = lng.toFixed(6);
            const latDecimal = lat.toFixed(6);
            
            if (this.isCoordinateReversed) {
                return { first: latDecimal, second: lngDecimal };
            } else {
                return { first: lngDecimal, second: latDecimal };
            }
        }
    }

    /**
     * 切换坐标格式
     */
    toggleCoordinateFormat() {
        this.coordinateFormat = this.coordinateFormat === 'decimal' ? 'dms' : 'decimal';
        
        // 更新按钮文本
        const formatBtn = document.getElementById('formatToggle');
        const textNodes = Array.from(formatBtn.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
        if (textNodes.length > 0) {
            textNodes[textNodes.length - 1].textContent = this.coordinateFormat === 'decimal' ? '小数点' : '度分秒';
        }
        
        // 重新显示当前坐标
        this.refreshCoordinateDisplay();
        
        const formatName = this.coordinateFormat === 'decimal' ? '小数点格式' : '度分秒格式';
        this.updateStatus(`已切换到${formatName}`);
    }

    /**
     * 切换坐标反选
     */
    toggleCoordinateReverse() {
        this.isCoordinateReversed = !this.isCoordinateReversed;
        
        // 更新按钮文本
        const reverseBtn = document.getElementById('coordReverse');
        const textNodes = Array.from(reverseBtn.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
        if (textNodes.length > 0) {
            textNodes[textNodes.length - 1].textContent = this.isCoordinateReversed ? '已反选' : '反选';
        }
        
        // 更新所有标签
        this.updateCoordinateLabels('hover');
        this.updateCoordinateLabels('click');
        
        // 重新显示当前坐标
        this.refreshCoordinateDisplay();
        
        const statusText = this.isCoordinateReversed ? '纬度在前' : '经度在前';
        this.updateStatus(`坐标显示顺序: ${statusText}`);
    }

    /**
     * 刷新坐标显示
     */
    refreshCoordinateDisplay() {
        // 重新触发当前的坐标显示
        // 如果有标记点，重新显示其坐标
        if (this.currentMarker) {
            const latlng = this.currentMarker.getLatLng();
            let displayLng = latlng.lng;
            let displayLat = latlng.lat;
            
            if (this.currentMapType === 'gaode') {
                const wgs84 = this.coordConverter.gcj02ToWgs84(latlng.lng, latlng.lat);
                displayLng = wgs84[0];
                displayLat = wgs84[1];
            }
            
            this.updateCoordinateDisplay('click', displayLng, displayLat);
        }
    }

    /**
     * 更新坐标显示
     */
    updateCoordinateDisplay(type, lng, lat) {
        const formatted = this.formatCoordinate(lng, lat);
        
        // 更新标签
        this.updateCoordinateLabels(type);
        
        if (this.isCoordinateReversed) {
            // 纬度在前
            document.getElementById(`${type}-lng`).textContent = formatted.second;
            document.getElementById(`${type}-lat`).textContent = formatted.first;
        } else {
            // 经度在前
            document.getElementById(`${type}-lng`).textContent = formatted.first;
            document.getElementById(`${type}-lat`).textContent = formatted.second;
        }
    }

    /**
     * 更新坐标标签
     */
    updateCoordinateLabels(type) {
        const lngLabel = document.getElementById(`${type}-lng-label`);
        const latLabel = document.getElementById(`${type}-lat-label`);
        
        if (this.isCoordinateReversed) {
            // 纬度在前，经度在后
            lngLabel.textContent = '纬度 (Lat):';
            latLabel.textContent = '经度 (Lng):';
        } else {
            // 经度在前，纬度在后
            lngLabel.textContent = '经度 (Lng):';
            latLabel.textContent = '纬度 (Lat):';
        }
    }


}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new CoordinateQueryApp();
});