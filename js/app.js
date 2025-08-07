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
        this.currentFixedCoords = null; // 当前固定坐标
        
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
        document.getElementById('mapTypeSelect').addEventListener('change', (e) => {
            this.switchMapType(e.target.value);
        });

        // 清除标记按钮
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearMarker();
        });

        // 格式切换按钮
        document.getElementById('formatBtn').addEventListener('click', () => {
            this.toggleCoordinateFormat();
        });

        // 坐标输入按钮
        document.getElementById('inputBtn').addEventListener('click', () => {
            this.showCoordInputModal();
        });

        // 模态框事件
        this.initModalEvents();



        // 地图鼠标移动事件 - 动态坐标显示
        this.map.on('mousemove', (e) => {
            this.updateDynamicCoordinates(e.latlng);
        });

        // 地图鼠标离开事件
        this.map.on('mouseout', () => {
            this.hideDynamicCoordinates();
        });

        // 地图点击事件 - 固定坐标显示
        this.map.on('click', (e) => {
            this.setFixedCoordinates(e.latlng);
        });

        // 复制按钮事件
        document.getElementById('copyCoords').addEventListener('click', () => {
            this.copyToClipboard('both');
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
     * 更新动态坐标显示
     */
    updateDynamicCoordinates(latlng) {
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

        // 显示动态坐标
        this.showDynamicCoordinates(displayLng, displayLat);

        // 更新状态栏
        this.updateStatus(`当前坐标: ${displayLng.toFixed(6)}, ${displayLat.toFixed(6)}`);
    }

    /**
     * 显示动态坐标
     */
    showDynamicCoordinates(lng, lat) {
        const coordElement = document.getElementById('dynamicCoord');
        const lngElement = document.getElementById('dynamic-lng');
        const latElement = document.getElementById('dynamic-lat');
        
        // 格式化坐标
        const formatted = this.formatCoordinate(lng, lat);
        
        // 更新坐标值
        lngElement.textContent = formatted.lng;
        latElement.textContent = formatted.lat;
        
        // 显示坐标面板
        coordElement.classList.add('show');
    }

    /**
     * 隐藏动态坐标显示
     */
    hideDynamicCoordinates() {
        const coordElement = document.getElementById('dynamicCoord');
        coordElement.classList.remove('show');
        this.updateStatus('移动鼠标查看坐标');
    }

    /**
     * 设置固定坐标显示
     */
    setFixedCoordinates(latlng) {
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

        // 存储当前坐标用于复制
        this.currentFixedCoords = {
            lng: displayLng,
            lat: displayLat
        };

        // 显示固定坐标
        this.showFixedCoordinates(displayLng, displayLat);

        // 更新状态栏
        this.updateStatus(`已固定坐标: ${displayLng.toFixed(6)}, ${displayLat.toFixed(6)}`);
    }

    /**
     * 显示固定坐标
     */
    showFixedCoordinates(lng, lat) {
        const coordElement = document.getElementById('fixedCoord');
        const lngElement = document.getElementById('fixed-lng');
        const latElement = document.getElementById('fixed-lat');
        
        // 格式化坐标
        const formatted = this.formatCoordinate(lng, lat);
        
        // 更新坐标值
        lngElement.textContent = formatted.lng;
        latElement.textContent = formatted.lat;
        
        // 显示坐标面板
        coordElement.style.display = 'block';
    }

    /**
     * 复制坐标到剪贴板
     */
    async copyToClipboard(type) {
        if (!this.currentFixedCoords) {
            this.updateStatus('请先点击地图获取坐标');
            return;
        }

        let value;
        if (type === 'both') {
            const formatted = this.formatCoordinate(this.currentFixedCoords.lng, this.currentFixedCoords.lat);
            value = `${formatted.lng}, ${formatted.lat}`;
        }

        try {
            await navigator.clipboard.writeText(value);
            this.updateStatus(`已复制坐标: ${value}`);
            
            // 视觉反馈
            const button = document.getElementById('copyCoords');
            button.style.background = 'rgba(0, 255, 136, 0.4)';
            button.style.borderColor = 'rgba(0, 255, 136, 0.6)';
            
            setTimeout(() => {
                button.style.background = '';
                button.style.borderColor = '';
            }, 500);
        } catch (err) {
            // 降级方案：使用旧的复制方法
            const textArea = document.createElement('textarea');
            textArea.value = value;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            this.updateStatus(`已复制坐标: ${value}`);
        }
    }



    /**
     * 清除标记
     */
    clearMarker() {
        if (this.currentMarker) {
            this.map.removeLayer(this.currentMarker);
            this.currentMarker = null;
        }

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
            return { lng: lngDMS, lat: latDMS };
        } else {
            const lngDecimal = lng.toFixed(6);
            const latDecimal = lat.toFixed(6);
            return { lng: lngDecimal, lat: latDecimal };
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
        
        const formatName = this.coordinateFormat === 'decimal' ? '小数点格式' : '度分秒格式';
        this.updateStatus(`已切换到${formatName}`);
    }

    /**
     * 显示坐标输入模态框
     */
    showCoordInputModal() {
        const modal = document.getElementById('coordModal');
        modal.style.display = 'block';
        
        // 清空输入框
        document.getElementById('inputLng').value = '';
        document.getElementById('inputLat').value = '';
        
        // 聚焦到第一个输入框
        setTimeout(() => {
            document.getElementById('inputLng').focus();
        }, 100);
    }

    /**
     * 隐藏坐标输入模态框
     */
    hideCoordInputModal() {
        const modal = document.getElementById('coordModal');
        modal.style.display = 'none';
    }

    /**
     * 初始化模态框事件
     */
    initModalEvents() {
        const modal = document.getElementById('coordModal');
        const closeBtn = document.querySelector('.close');
        const cancelBtn = document.getElementById('cancelBtn');
        const locateBtn = document.getElementById('locateBtn');
        
        // 关闭按钮
        closeBtn.addEventListener('click', () => {
            this.hideCoordInputModal();
        });
        
        // 取消按钮
        cancelBtn.addEventListener('click', () => {
            this.hideCoordInputModal();
        });
        
        // 定位按钮
        locateBtn.addEventListener('click', () => {
            this.locateByCoordinates();
        });
        
        // 点击模态框外部关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideCoordInputModal();
            }
        });
        
        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                this.hideCoordInputModal();
            }
        });
        
        // 回车键定位
        const inputs = [document.getElementById('inputLng'), document.getElementById('inputLat')];
        inputs.forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.locateByCoordinates();
                }
            });
        });
    }

    /**
     * 根据输入的坐标进行定位
     */
    locateByCoordinates() {
        const lngInput = document.getElementById('inputLng');
        const latInput = document.getElementById('inputLat');
        
        const lng = parseFloat(lngInput.value);
        const lat = parseFloat(latInput.value);
        
        // 验证输入
        if (isNaN(lng) || isNaN(lat)) {
            alert('请输入有效的经纬度数值');
            return;
        }
        
        if (lng < -180 || lng > 180) {
            alert('经度范围应在 -180 到 180 之间');
            lngInput.focus();
            return;
        }
        
        if (lat < -90 || lat > 90) {
            alert('纬度范围应在 -90 到 90 之间');
            latInput.focus();
            return;
        }
        
        // 根据当前地图类型转换坐标
        let mapLng = lng;
        let mapLat = lat;
        
        if (this.currentMapType === 'gaode') {
            // 输入的是WGS84坐标，需要转换为GCJ02用于地图显示
            const gcj02 = this.coordConverter.wgs84ToGcj02(lng, lat);
            mapLng = gcj02[0];
            mapLat = gcj02[1];
        }
        
        // 设置地图中心和缩放级别
        this.map.setView([mapLat, mapLng], 15);
        
        // 添加标记
        this.clearMarker();
        this.currentMarker = L.marker([mapLat, mapLng], {
            icon: L.divIcon({
                className: 'pin-marker',
                html: '<div style="color: #ff4757; font-size: 24px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">📍</div>',
                iconSize: [24, 24],
                iconAnchor: [12, 24]
            })
        }).addTo(this.map);
        

        
        // 添加弹出框
        const popupContent = `
            <div style="font-family: monospace; font-size: 12px; line-height: 1.4;">
                <strong>输入坐标定位</strong><br>
                <strong>经度:</strong> ${lng.toFixed(6)}<br>
                <strong>纬度:</strong> ${lat.toFixed(6)}
            </div>
        `;
        
        this.currentMarker.bindPopup(popupContent).openPopup();
        
        // 更新状态
        this.updateStatus(`已定位到坐标: ${lng.toFixed(6)}, ${lat.toFixed(6)}`);
        
        // 关闭模态框
        this.hideCoordInputModal();
    }






}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new CoordinateQueryApp();
});