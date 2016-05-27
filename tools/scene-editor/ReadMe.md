Scene-Editor
-----------
Scene-Editor是与Egret-ECS体系相对应的可视化编辑器项目

请先执行

```
npm install
```
若遇到无法下载electron-prebuilt所需的二进制包问题，请根据提示手动下载官网的镜像包并解压到electron-prebuilt/dist下，在electron-prebuilt根目录下新建path.txt文件并设置electron入口的相对地址。

#1.目录说明

    主目录是一个electron-quick-start工程
    editor 目录是React编辑器项目 采用webpack打包
    previewer 目录是标准的egret项目目录,用于预览的一个定制的运行时环境
    panels 目录是工作空间选择和编辑等页面
    
#2.命令说明
1.编辑器面板调试模式(不包含文件操作)

```
npm run debug
```
日常的界面和交互开发在此模式下完成，使用网页调试即可。

2.编辑器面板发布模式

```
npm run deploy
```
只有发布后才可以用app打开

3.预览界面

```
cd previewer && egret build
```
需要安装白鹭引擎

4.使用app打开应用

```
npm start
```
具有完整的项目选择界面的app

5.打包app

```
npm run mac-bundle
```
将该app打包成能够分发的应用。